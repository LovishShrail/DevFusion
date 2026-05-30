import React, { useState, useEffect } from 'react'
import Terminal from './Terminal'

const CodeEditor = ({
    fileTree,
    currentFile,
    setCurrentFile,
    setFileTree,
    saveFileTree,
    runProject,
    openFiles,
    terminalRef
}) => {
    const [localContent, setLocalContent] = useState("");

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
            }

            // Restore caret selection position after state sync
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-950">

            {/* 1. TOP BAR: List open files and run trigger */}
            <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 h-10 px-4 shrink-0">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {openFiles.map((file, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentFile(file)}
                            className={`flex items-center gap-2 text-sm px-3 py-1 rounded-t-md transition-colors border-t border-x ${
                                currentFile === file 
                                ? 'bg-slate-950 text-white border-slate-800' 
                                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                            }`}
                        >
                            {file}
                        </button>
                    ))}
                </div>

                <button
                    onClick={runProject}
                    className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors'
                >
                    Run <i className="ri-play-fill"></i>
                </button>
            </div>

            {/* 2. CODE AREA: Dynamic and highly stable textarea code pane */}
            <div className="flex-grow overflow-auto h-1 relative bg-slate-950 flex">
                {currentFile && fileTree[currentFile] && fileTree[currentFile].file ? (
                    <textarea
                        value={localContent}
                        onChange={handleContentChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full outline-none p-6 font-mono text-sm bg-slate-950 text-slate-200 resize-none border-none focus:ring-0 focus:outline-none"
                        style={{
                            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                            lineHeight: '1.6',
                            tabSize: 2
                        }}
                        placeholder="// Write your code here..."
                    />
                ) : (
                    <div className="flex-grow flex items-center justify-center text-slate-600 flex-col gap-2">
                        <i className="ri-code-s-slash-line text-4xl opacity-50"></i>
                        <span className="text-sm">Select a file from explorer to start editing</span>
                    </div>
                )}
            </div>

            {/* 3. TERMINAL AREA: Pins to the bottom */}
            <div className="shrink-0 h-52 border-t border-slate-800 bg-slate-950">
                <Terminal ref={terminalRef} />
            </div>
            
        </div>
    )
}

export default CodeEditor