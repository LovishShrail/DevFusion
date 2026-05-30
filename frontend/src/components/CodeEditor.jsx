import React, { useState, useEffect } from 'react'
import Terminal from './Terminal'
import { sendMessage } from '../config/socket'

const CodeEditor = ({
    fileTree,
    currentFile,
    setCurrentFile,
    setFileTree,
    saveFileTree,
    runProject,
    openFiles,
    setOpenFiles,
    terminalRef
}) => {
    const [localContent, setLocalContent] = useState("");

    const closeFile = (fileToClose) => {
        const remainingFiles = openFiles.filter(f => f !== fileToClose);
        setOpenFiles(remainingFiles);

        // Shift selection dynamically if the closed file was selected
        if (currentFile === fileToClose) {
            if (remainingFiles.length > 0) {
                setCurrentFile(remainingFiles[remainingFiles.length - 1]);
            } else {
                setCurrentFile(null);
            }
        }
    };

    // Synchronize local content when current file shifts or files are modified remotely
    useEffect(() => {
        if (currentFile && fileTree[currentFile] && fileTree[currentFile].file) {
            setLocalContent(fileTree[currentFile].file.contents || "");
        } else {
            setLocalContent("");
        }
    }, [currentFile, fileTree[currentFile]?.file?.contents]);

    const handleContentChange = (e) => {
        const updatedContent = e.target.value;
        setLocalContent(updatedContent);

        if (currentFile && fileTree[currentFile]) {
            const ft = {
                ...fileTree,
                [currentFile]: {
                    ...fileTree[currentFile],
                    file: {
                        ...fileTree[currentFile].file,
                        contents: updatedContent
                    }
                }
            };
            setFileTree(ft);

            // Broadcast real-time keypress update to other collaborators
            sendMessage('code-update', {
                file: currentFile,
                contents: updatedContent
            });
        }
    };

    const handleBlur = () => {
        if (currentFile && fileTree[currentFile]) {
            const ft = {
                ...fileTree,
                [currentFile]: {
                    ...fileTree[currentFile],
                    file: {
                        ...fileTree[currentFile].file,
                        contents: localContent
                    }
                }
            };
            saveFileTree(ft);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const val = e.target.value;
            const newContent = val.substring(0, start) + "  " + val.substring(end);
            
            setLocalContent(newContent);

            if (currentFile && fileTree[currentFile]) {
                const ft = {
                    ...fileTree,
                    [currentFile]: {
                        ...fileTree[currentFile],
                        file: {
                            ...fileTree[currentFile].file,
                            contents: newContent
                        }
                    }
                };
                setFileTree(ft);

                // Broadcast real-time tab insert update to other collaborators
                sendMessage('code-update', {
                    file: currentFile,
                    contents: newContent
                });
            }

            // Restore caret selection position after state sync
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
        }
    };

    // Get file extension for icon hint
    const getFileIcon = (name) => {
        if (!name) return 'ri-file-line';
        const ext = name.split('.').pop()?.toLowerCase();
        const map = {
            js: 'ri-javascript-line',
            jsx: 'ri-reactjs-line',
            ts: 'ri-code-s-slash-line',
            tsx: 'ri-reactjs-line',
            json: 'ri-braces-line',
            css: 'ri-css3-line',
            html: 'ri-html5-line',
            md: 'ri-markdown-line',
        };
        return map[ext] || 'ri-file-code-line';
    };

    return (
        <div className="flex flex-col h-full w-full">

            {/* ── Tab Bar ── */}
            <div className="flex items-center justify-between bg-[#000a35]/50 border-b border-white/[0.06] h-11 px-2 shrink-0 select-none">
                <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1 min-w-0 mr-3">
                    {openFiles.map((file, index) => (
                        <div
                            key={index}
                            className={`group flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md shrink-0 transition-all cursor-pointer ${
                                currentFile === file 
                                ? 'bg-white/[0.07] text-white' 
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                            }`}
                            onClick={() => setCurrentFile(file)}
                        >
                            <i className={`${getFileIcon(file)} text-[10px] ${currentFile === file ? 'text-lagoon-spark/70' : 'text-slate-600'}`}></i>
                            <span className="font-medium">{file}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeFile(file);
                                }}
                                className='opacity-0 group-hover:opacity-100 ml-1 text-slate-500 hover:text-red-400 transition-all text-[10px] p-0.5 rounded'
                                title="Close file"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={runProject}
                    className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all shrink-0 border border-emerald-500/20 hover:border-emerald-500/30"
                >
                    <i className="ri-play-fill text-xs"></i>
                    <span>Run</span>
                </button>
            </div>

            {/* ── Code Area ── */}
            <div className="flex-1 overflow-auto relative min-h-0">
                {currentFile && fileTree[currentFile] && fileTree[currentFile].file ? (
                    <div className="relative h-full">
                        {/* Line numbers gutter effect via gradient */}
                        <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-white/[0.01] to-transparent pointer-events-none"></div>
                        <textarea
                            value={localContent}
                            onChange={handleContentChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full outline-none p-5 pl-14 text-[13px] bg-transparent text-slate-200 resize-none border-none focus:ring-0 focus:outline-none caret-lagoon-spark"
                            style={{
                                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                                lineHeight: '1.7',
                                tabSize: 2
                            }}
                            placeholder="// Write your code here..."
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center flex-col gap-3 select-none">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                            <i className="ri-code-s-slash-line text-2xl text-lagoon-spark/30"></i>
                        </div>
                        <span className="text-[12px] text-slate-600">Select a file to start editing</span>
                    </div>
                )}
            </div>

            {/* ── Terminal ── */}
            <div className="shrink-0 h-44 border-t border-white/[0.06]">
                <Terminal ref={terminalRef} />
            </div>
            
        </div>
    )
}

export default CodeEditor