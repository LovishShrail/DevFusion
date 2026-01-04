import React, { useState } from 'react'
import hljs from 'highlight.js'
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

    return (
        // ✅ ROOT: Strict h-full to fit parent, flex-col to stack elements
        <div className="flex flex-col h-full w-full bg-slate-950">

            {/* 1. TOP BAR: Fixed height, never shrinks */}
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

            {/* 2. CODE AREA: The tricky part */}
            {/* flex-grow: Fills space */}
            {/* overflow-auto: Enables internal scrolling */}
            {/* h-1: HACK that forces flexbox to calculate height correctly relative to parent */}
            <div className="flex-grow overflow-auto h-1 relative bg-slate-950">
                
                {fileTree[currentFile] && fileTree[currentFile].file && (
                    <pre className="h-full m-0">
                        <code
                            className="block h-full outline-none p-6 font-mono text-sm"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                const updatedContent = e.target.innerText;
                                const ft = {
                                    ...fileTree,
                                    [currentFile]: {
                                        file: {
                                            contents: updatedContent
                                        }
                                    }
                                }
                                setFileTree(ft)
                                saveFileTree(ft)
                            }}
                            dangerouslySetInnerHTML={{ 
                                __html: hljs.highlight('javascript', fileTree[currentFile].file.contents || "").value 
                            }}
                            style={{
                                fontFamily: '"JetBrains Mono", monospace',
                                lineHeight: '1.6',
                                backgroundColor: 'transparent',
                                color: '#e2e8f0',
                                whiteSpace: 'pre-wrap', // Prevents horizontal scroll hell
                                tabSize: 2
                            }}
                        />
                    </pre>
                )}
            </div>

            {/* 3. TERMINAL AREA: Fixed height, pinned to bottom */}
            {/* shrink-0: NEVER lets this get squashed */}
            <div className="shrink-0 h-52 border-t border-slate-800 bg-slate-950">
                <Terminal ref={terminalRef} />
            </div>
            
        </div>
    )
}

export default CodeEditor