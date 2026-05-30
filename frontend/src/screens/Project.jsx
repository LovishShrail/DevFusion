import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useLocation, useParams } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import { getWebContainer } from '../config/webcontainer'

// Components
import CollaboratorModal from '../components/CollaboratorModal'
import SidePanel from '../components/SidePanel'
import ChatPanel from '../components/ChatPanel'
import FileTree from '../components/FileTree'
import CodeEditor from '../components/CodeEditor'

const Project = () => {
    const location = useLocation()
    const { projectId } = useParams()
    const { user } = useContext(UserContext)

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(location.state?.project || {})
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [fileTree, setFileTree] = useState({})
    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])
    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)
    const [runProcess, setRunProcess] = useState(null)
    const [isAiTyping, setIsAiTyping] = useState(false)

    const terminalInstance = useRef(null)

    // --- Handlers ---
    const handleUserClick = (id) => {
        setSelectedUserId(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    }

    function addCollaborators() {
        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(() => setIsModalOpen(false))
            .catch(err => console.log(err))
    }

    const send = () => {
        if (message.trim().toLowerCase().includes('@ai')) {
            setIsAiTyping(true)
        }
        sendMessage('project-message', { message, sender: user })
        setMessages(prev => [...prev, { sender: user, message }])
        setMessage("")
    }

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).catch(err => console.log(err))
    }

    const deleteFile = (fileName) => {
        // Prevent deleting the currently open file to avoid crashes
        if (fileName === currentFile) {
            setCurrentFile(null)
            setOpenFiles(prev => prev.filter(f => f !== fileName))
        }

        // Create a copy of the fileTree without the deleted file
        const newFileTree = { ...fileTree }
        delete newFileTree[fileName]

        setFileTree(newFileTree)
        saveFileTree(newFileTree)
    }

    
    function getWebContainerTree(tree) {
        const newTree = {};
        
        Object.keys(tree).forEach(path => {
            const parts = path.split('/');
            let current = newTree;
            
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    // It's the file itself
                    current[part] = tree[path];
                } else {
                    // It's a folder
                    if (!current[part]) {
                        current[part] = { directory: {} };
                    }
                    current = current[part].directory;
                }
            });
        });
        
        return newTree;
    }

    // --- The Complex Run Logic (Now a function passed down) ---
    const runProject = async () => {
        const mountStructure = getWebContainerTree(fileTree);
        await webContainer.mount(mountStructure)

        const buildCmd = project.buildCommand?.mainItem || 'npm'
        const buildArgs = project.buildCommand?.commands || ['install', '--no-audit', '--no-fund']

        terminalInstance.current.writeln(`\n> ${buildCmd} ${buildArgs.join(' ')}`)

        const installProcess = await webContainer.spawn(buildCmd, buildArgs)

        installProcess.output.pipeTo(new WritableStream({
            write(chunk) { terminalInstance.current.write(chunk) }
        }))

        if ((await installProcess.exit) !== 0) {
            terminalInstance.current.writeln('\nInstallation failed!')
            return;
        }

        if (runProcess) runProcess.kill()

        const startCmd = project.startCommand?.mainItem || 'npm'
        const startArgs = project.startCommand?.commands || ['start']

        terminalInstance.current.writeln(`\n> ${startCmd} ${startArgs.join(' ')}`)

        let tempRunProcess = await webContainer.spawn(startCmd, startArgs);

        tempRunProcess.output.pipeTo(new WritableStream({
            write(chunk) { terminalInstance.current.write(chunk) }
        }))

        if ((await installProcess.exit) !== 0) {
            terminalInstance.current.writeln('\nInstallation failed!');
            return;
        }

        setRunProcess(tempRunProcess)

        webContainer.on('server-ready', (port, url) => {
            console.log(port, url)
            setIframeUrl(url)
        })
    }

    // --- Effects ---
    useEffect(() => {
        const socket = initializeSocket(location.state.project._id);

        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }

        receiveMessage('project-message', data => {
            setIsAiTyping(false)
            if (data.sender._id == 'ai') {
                try {
                    const message = JSON.parse(data.message)
                    if (message.fileTree) {
                        webContainer?.mount(getWebContainerTree(message.fileTree))
                        setFileTree(message.fileTree || {})
                    }
                    if (message.buildCommand || message.startCommand) {
                        setProject(prev => ({ ...prev, buildCommand: message.buildCommand, startCommand: message.startCommand }))
                    }
                } catch (parseErr) {
                    console.error("Failed to parse AI message payload:", parseErr);
                }
            }
            setMessages(prev => [...prev, data])
        })

        axios.get(`/projects/get-messages/${location.state.project._id}`).then(res => {
            setMessages(res.data.messages.map(msg => ({
                sender: { email: msg.sender, _id: msg.sender === 'AI' ? 'ai' : 'unknown' },
                message: msg.message
            })))
        })

        axios.get(`/projects/get-project/${projectId}`).then(res => {
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => setUsers(res.data.users))

        return () => { socket.off('project-message') }
    }, [location.state.project._id])

    // --- Render ---
    return (
        <main className='h-full w-screen flex bg-slate-950 overflow-hidden font-sans'>
            {/* Left Panel */}
            <section className="left flex flex-col h-full min-w-[400px] max-w-[450px] bg-slate-950 border-r border-white/5 relative shadow-xl z-10">
                <ChatPanel
                    isSidePanelOpen={isSidePanelOpen}
                    setIsSidePanelOpen={setIsSidePanelOpen}
                    setIsModalOpen={setIsModalOpen}
                    messages={messages}
                    user={user}
                    message={message}
                    setMessage={setMessage}
                    send={send}
                    isAiTyping={isAiTyping}
                />
                <SidePanel 
                    isSidePanelOpen={isSidePanelOpen} 
                    setIsSidePanelOpen={setIsSidePanelOpen} 
                    users={project.users}
                    setIsModalOpen={setIsModalOpen}
                 />
            </section>

            {/* Right Panel */}
            <section className="right flex-grow h-full flex flex-col bg-slate-950 relative">

                <div className="flex-grow flex w-full relative">
                    <FileTree
                        className="bg-slate-900 border-r border-white/5"
                        fileTree={fileTree}
                        setCurrentFile={setCurrentFile}
                        currentFile={currentFile}
                        setOpenFiles={setOpenFiles}
                        openFiles={openFiles}
                        deleteFile={deleteFile}
                    />

                    <div className="flex-grow min-w-0 h-full bg-slate-950">
                        <CodeEditor className="flex-grow min-w-0 h-full"
                            fileTree={fileTree}
                            currentFile={currentFile}
                            setCurrentFile={setCurrentFile}
                            setFileTree={setFileTree}
                            saveFileTree={saveFileTree}
                            runProject={runProject}
                            openFiles={openFiles}
                            terminalRef={terminalInstance}
                        />
                    </div>

                    {/* Preview Portal */}
                    {iframeUrl && webContainer && (
                        <div className="flex min-w-96 flex-col h-full border-l border-slate-800 bg-slate-900 shrink-0">

                            {/* Browser Address Bar */}
                            <div className="address-bar h-12 flex items-center gap-3 px-4 bg-slate-900 border-b border-slate-800">

                                {/* Window Controls (Decoration) */}
                                <div className="flex gap-1.5 group">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80 group-hover:bg-red-500 transition-colors"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 group-hover:bg-yellow-500 transition-colors"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80 group-hover:bg-green-500 transition-colors"></div>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex gap-2 text-slate-400">
                                    <button className="hover:text-white transition-colors"><i className="ri-arrow-left-line"></i></button>
                                    <button className="hover:text-white transition-colors"><i className="ri-arrow-right-line"></i></button>
                                    <button
                                        onClick={() => {
                                            // Simple refresh hack for iframe
                                            const url = iframeUrl;
                                            setIframeUrl('');
                                            setTimeout(() => setIframeUrl(url), 10);
                                        }}
                                        className="hover:text-white transition-colors"
                                    >
                                        <i className="ri-refresh-line"></i>
                                    </button>
                                </div>

                                {/* Address Input */}
                                <div className="flex-grow relative">
                                    <div className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-500">
                                        <i className="ri-lock-fill text-xs"></i>
                                    </div>
                                    <input
                                        type="text"
                                        onChange={(e) => setIframeUrl(e.target.value)}
                                        value={iframeUrl}
                                        className="w-full py-1.5 pl-8 pr-3 bg-slate-800 text-slate-300 rounded-md text-sm outline-none border border-transparent focus:border-blue-500/50 focus:bg-slate-700/50 transition-all font-mono"
                                    />
                                </div>

                                {/* External Link */}
                                <a
                                    href={iframeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-400 hover:text-white transition-colors"
                                    title="Open in new tab"
                                >
                                    <i className="ri-external-link-line"></i>
                                </a>

                            </div>

                            {/* Iframe Content */}
                            <div className="flex-grow relative bg-white">
                                {/* Loading Overlay (Optional: You can add state for this) */}
                                {!iframeUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                                        <i className="ri-loader-4-line text-3xl animate-spin"></i>
                                    </div>
                                )}

                                <iframe
                                    src={iframeUrl}
                                    className="w-full h-full border-none"
                                    title="Project Preview"
                                ></iframe>
                            </div>
                        </div>
                    )}

                </div>

            </section>

            <CollaboratorModal
                isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} users={users} selectedUserId={selectedUserId} handleUserClick={handleUserClick} addCollaborators={addCollaborators}
            />
        </main>
    )
}

export default Project