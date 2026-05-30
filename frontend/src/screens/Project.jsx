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
            projectId: projectId,
            users: Array.from(selectedUserId)
        }).then((res) => {
            if (res.data.project) {
                setProject(res.data.project);
            }
            setIsModalOpen(false);
            setSelectedUserId(new Set());
        }).catch(err => console.log(err))
    }

    const send = () => {
        if (message.trim().toLowerCase().includes('@ai')) {
            setIsAiTyping(true)
        }
        sendMessage('project-message', { message, sender: user })
        setMessages(prev => [...prev, { sender: user, message }])
        setMessage("")
    }

    function saveFileTree(ft, buildCmd, startCmd) {
        const payload = {
            projectId: project._id,
            fileTree: ft
        }
        if (buildCmd !== undefined) payload.buildCommand = buildCmd
        if (startCmd !== undefined) payload.startCommand = startCmd
        axios.put('/projects/update-file-tree', payload).catch(err => console.log(err))
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
        // Defensive & initialization checks
        if (!webContainer) {
            console.error("WebContainer is not initialized yet");
            terminalInstance.current?.writeln('\r\n\x1b[31mError: WebContainer is still initializing. Please wait a moment and try again.\x1b[0m');
            return;
        }

        if (!terminalInstance.current) {
            console.error("Terminal instance is not available");
            return;
        }

        if (!fileTree || Object.keys(fileTree).length === 0) {
            terminalInstance.current.writeln('\r\n\x1b[33mWarning: File tree is empty. Add some files before running the project.\x1b[0m');
            return;
        }

        const mountStructure = getWebContainerTree(fileTree);
        await webContainer.mount(mountStructure)

        // Build command determination
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

        // Terminate any previous execution process safely
        if (runProcess) runProcess.kill()

        // Smart start command detection
        let startCmd = project.startCommand?.mainItem
        let startArgs = project.startCommand?.commands

        if (!startCmd) {
            // Auto-detect start command from fileTree
            if (fileTree['package.json'] && fileTree['package.json'].file) {
                try {
                    const pkg = JSON.parse(fileTree['package.json'].file.contents)
                    if (pkg.scripts && pkg.scripts.start) {
                        startCmd = 'npm'
                        startArgs = ['start']
                    } else if (pkg.main) {
                        startCmd = 'node'
                        startArgs = [pkg.main]
                    } else if (fileTree['app.js']) {
                        startCmd = 'node'
                        startArgs = ['app.js']
                    } else if (fileTree['index.js']) {
                        startCmd = 'node'
                        startArgs = ['index.js']
                    } else {
                        startCmd = 'npm'
                        startArgs = ['start']
                    }
                } catch (e) {
                    console.error("Failed to parse package.json for start command detection:", e)
                    startCmd = 'npm'
                    startArgs = ['start']
                }
            } else {
                if (fileTree['app.js']) {
                    startCmd = 'node'
                    startArgs = ['app.js']
                } else if (fileTree['index.js']) {
                    startCmd = 'node'
                    startArgs = ['index.js']
                } else {
                    startCmd = 'npm'
                    startArgs = ['start']
                }
            }
        }

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
        const socket = initializeSocket(projectId);

        if (!webContainer) {
            // Defer boot so the Terminal component's useEffect has time to mount
            // and assign terminalInstance.current before we try to write to it
            setTimeout(() => {
                terminalInstance.current?.writeln('\x1b[36m❯\x1b[0m Booting WebContainer...');
                getWebContainer().then(container => {
                    setWebContainer(container)
                    terminalInstance.current?.writeln('\x1b[32m❯ WebContainer booted successfully!\x1b[0m\r\n');
                    console.log("container started")
                }).catch(err => {
                    console.error("WebContainer boot failed:", err);
                    terminalInstance.current?.writeln('\x1b[31m❯ WebContainer boot failed!\x1b[0m');
                    terminalInstance.current?.writeln(`\x1b[31mError: ${err.message || err}\x1b[0m`);
                    terminalInstance.current?.writeln('\x1b[33mEnsure you are on localhost or HTTPS and your browser supports SharedArrayBuffer.\x1b[0m');
                });
            }, 200);
        }

        receiveMessage('project-message', data => {
            setIsAiTyping(false)
            if (data.sender._id == 'ai') {
                try {
                    const message = JSON.parse(data.message)
                    if (message.fileTree) {
                        webContainer?.mount(getWebContainerTree(message.fileTree))
                        setFileTree(message.fileTree || {})
                        // Persist fileTree AND commands together in one DB write
                        saveFileTree(
                            message.fileTree || {},
                            message.buildCommand,
                            message.startCommand
                        )
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

        receiveMessage('code-update', data => {
            const { file, contents } = data;
            setFileTree(prev => {
                if (prev[file]) {
                    const newFt = {
                        ...prev,
                        [file]: {
                            ...prev[file],
                            file: {
                                ...prev[file].file,
                                contents
                            }
                        }
                    };
                    webContainer?.mount(getWebContainerTree(newFt));
                    return newFt;
                }
                return prev;
            });
        });

        axios.get(`/projects/get-messages/${projectId}`).then(res => {
            setMessages(res.data.messages.map(msg => ({
                sender: { username: msg.sender, email: msg.sender, _id: msg.sender === 'AI' ? 'ai' : 'unknown' },
                message: msg.message
            })))
        })

        axios.get(`/projects/get-project/${projectId}`).then(res => {
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => setUsers(res.data.users))

        return () => { socket.off('project-message') }
    }, [projectId])

    // --- Render ---
    return (
        <main className='h-full w-full flex overflow-hidden select-none relative'>

            {/* ──────────────────── LEFT: Chat Panel ──────────────────── */}
            <section className="flex flex-col h-full w-[380px] min-w-[340px] max-w-[420px] bg-[#000620]/90 border-r border-white/[0.06] relative backdrop-blur-xl z-10">
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

            {/* ──────────────────── RIGHT: Editor Area ──────────────────── */}
            <section className="flex-1 h-full flex min-w-0 overflow-hidden">

                {/* File Explorer */}
                <FileTree
                    fileTree={fileTree}
                    setCurrentFile={setCurrentFile}
                    currentFile={currentFile}
                    setOpenFiles={setOpenFiles}
                    openFiles={openFiles}
                    deleteFile={deleteFile}
                />

                {/* Code Editor + Terminal (takes remaining space) */}
                <div className="flex-1 min-w-0 h-full flex flex-col">
                    <CodeEditor
                        fileTree={fileTree}
                        currentFile={currentFile}
                        setCurrentFile={setCurrentFile}
                        setFileTree={setFileTree}
                        saveFileTree={saveFileTree}
                        runProject={runProject}
                        openFiles={openFiles}
                        setOpenFiles={setOpenFiles}
                        terminalRef={terminalInstance}
                    />
                </div>

                {/* Preview Portal */}
                {iframeUrl && webContainer && (
                    <div className="flex flex-col h-full w-[420px] min-w-[320px] border-l border-white/[0.06] bg-[#000620]/80 shrink-0">

                        {/* Browser Chrome Bar */}
                        <div className="h-11 flex items-center gap-3 px-4 bg-[#000a35]/70 border-b border-white/[0.06] shrink-0">

                            {/* Window Dots — red is functional kill button */}
                            <div className="flex gap-1.5 select-none">
                                <button
                                    onClick={() => {
                                        if (runProcess) {
                                            runProcess.kill()
                                            setRunProcess(null)
                                        }
                                        setIframeUrl(null)
                                        terminalInstance.current?.writeln('\r\n\x1b[31m❯ Server stopped.\x1b[0m\r\n')
                                    }}
                                    className="w-2.5 h-2.5 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors cursor-pointer"
                                    title="Stop server & close preview"
                                />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" title="Minimise (not available)" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" title="Preview" />
                            </div>

                            {/* Nav */}
                            <div className="flex gap-1.5 text-slate-500">
                                <button className="hover:text-white transition-colors p-0.5"><i className="ri-arrow-left-s-line text-sm"></i></button>
                                <button className="hover:text-white transition-colors p-0.5"><i className="ri-arrow-right-s-line text-sm"></i></button>
                                <button
                                    onClick={() => {
                                        const url = iframeUrl;
                                        setIframeUrl('');
                                        setTimeout(() => setIframeUrl(url), 10);
                                    }}
                                    className="hover:text-white transition-colors p-0.5"
                                >
                                    <i className="ri-refresh-line text-sm"></i>
                                </button>
                            </div>

                            {/* Address Bar */}
                            <div className="flex-1 relative">
                                <i className="ri-lock-2-fill absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400/60 text-[10px]"></i>
                                <input
                                    type="text"
                                    onChange={(e) => setIframeUrl(e.target.value)}
                                    value={iframeUrl}
                                    className="w-full py-1 pl-7 pr-3 bg-white/[0.04] text-slate-400 rounded-md text-[11px] outline-none border border-white/[0.06] focus:border-lagoon-spark/40 transition-all font-mono"
                                />
                            </div>

                            {/* Open in new tab */}
                            <a
                                href={iframeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-500 hover:text-white transition-colors"
                                title="Open in new tab"
                            >
                                <i className="ri-external-link-line text-sm"></i>
                            </a>

                            {/* Kill Server button */}
                            <button
                                onClick={() => {
                                    if (runProcess) {
                                        runProcess.kill()
                                        setRunProcess(null)
                                    }
                                    setIframeUrl(null)
                                    terminalInstance.current?.writeln('\r\n\x1b[31m❯ Server stopped.\x1b[0m\r\n')
                                }}
                                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all shrink-0"
                                title="Kill server & close preview"
                            >
                                <i className="ri-stop-circle-line text-[11px]"></i>
                                <span>Kill</span>
                            </button>
                        </div>

                        {/* Iframe */}
                        <div className="flex-1 relative bg-white">
                            <iframe
                                src={iframeUrl}
                                className="w-full h-full border-none"
                                title="Project Preview"
                            ></iframe>
                        </div>
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