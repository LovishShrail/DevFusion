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

    // --- The Complex Run Logic (Now a function passed down) ---
    const runProject = async () => {
        await webContainer.mount(fileTree)
        
        const buildCmd = project.buildCommand?.mainItem || 'npm'
        const buildArgs = project.buildCommand?.commands || ['install']

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
            if (data.sender._id == 'ai') {
                const message = JSON.parse(data.message)
                webContainer?.mount(message.fileTree)
                if (message.fileTree) setFileTree(message.fileTree || {})
                if (message.buildCommand || message.startCommand) {
                    setProject(prev => ({ ...prev, buildCommand: message.buildCommand, startCommand: message.startCommand }))
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
        <main className='h-full w-full flex bg-slate-950'>
            {/* Left Panel */}
            <section className="left relative flex flex-col h-full min-w-[450px] bg-slate-900 border-r border-slate-800">
                <ChatPanel 
                    isSidePanelOpen={isSidePanelOpen}
                    setIsSidePanelOpen={setIsSidePanelOpen}
                    setIsModalOpen={setIsModalOpen}
                    messages={messages}
                    user={user}
                    message={message}
                    setMessage={setMessage}
                    send={send}
                />
                <SidePanel isSidePanelOpen={isSidePanelOpen} setIsSidePanelOpen={setIsSidePanelOpen} users={project.users} />
            </section>

            {/* Right Panel */}
            <section className="right flex-grow h-full flex bg-slate-950">
                <FileTree 
                    fileTree={fileTree} 
                    setCurrentFile={setCurrentFile} 
                    currentFile={currentFile} 
                    setOpenFiles={setOpenFiles} 
                    openFiles={openFiles} 
                    deleteFile={deleteFile}
                />

                <CodeEditor 
                    fileTree={fileTree}
                    currentFile={currentFile}
                    setCurrentFile={setCurrentFile}
                    setFileTree={setFileTree}
                    saveFileTree={saveFileTree}
                    runProject={runProject}
                    openFiles={openFiles}
                    terminalRef={terminalInstance}
                />

                {iframeUrl && webContainer && (
                    <div className="flex min-w-96 flex-col h-full border-l border-slate-800 bg-white">
                        <div className="address-bar p-2 bg-slate-800 flex items-center">
                            <input type="text" 
                            onChange={(e) => setIframeUrl(e.target.value)} 
                            value={iframeUrl} 
                            className="w-full p-1 px-3 bg-slate-700 text-slate-200 rounded text-sm outline-none border border-slate-600 focus:border-blue-500" />
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full bg-white"></iframe>
                    </div>
                )}
            </section>

            <CollaboratorModal 
                isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} users={users} selectedUserId={selectedUserId} handleUserClick={handleUserClick} addCollaborators={addCollaborators}
            />
        </main>
    )
}

export default Project