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
    terminalRef // We pass the ref down so the parent can access it if needed
}) => {

    return (
        <div className="code-editor flex flex-col flex-grow h-full shrink bg-slate-950">

            {/* Top Bar: Tabs & Run Button */}
            <div className="top flex justify-between w-full bg-slate-900 border-b border-slate-800">
                <div className="files flex overflow-x-auto">
                    {openFiles.map((file, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentFile(file)}
                            className={`open-file cursor-pointer p-2 px-4 flex items-center gap-2 text-sm transition-colors
                        ${currentFile === file ? 'bg-slate-800 text-white border-t-2 border-blue-500' : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <p>{file}</p>
                        </button>
                    ))}
                </div>

                <div className="actions flex gap-2 p-1">
                    <button
                        onClick={runProject}
                        className='p-1 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium'
                    >
                        Run <i className="ri-play-fill"></i>
                    </button>
                </div>
            </div>

            {/* Main Editor Area + Terminal */}
            <div className="bottom flex flex-col flex-grow max-w-full shrink overflow-auto bg-slate-950">
                {fileTree[currentFile] && (
                    <div className="code-editor-area flex-grow overflow-auto bg-transparent relative text-white">
                        {/* Line Numbers & Code */}
                        <pre className="hljs h-full m-0 bg-transparent">
                            <code
                                style={{
                                    fontFamily: '"Fira Code", monospace',
                                    fontSize: '15px',
                                    backgroundColor: 'transparent', // Important for dark mode
                                    color: '#e2e8f0'
                                }}
                                className="hljs h-full outline-none p-4"
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
                                dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value }}

                            />
                        </pre>
                    </div>
                )}
                {/* Terminal Component */}
                <Terminal ref={terminalRef} />
            </div>
        </div>
    )
}

export default CodeEditor