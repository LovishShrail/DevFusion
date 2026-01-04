import React from 'react'

const FileTree = ({ 
    fileTree, 
    setCurrentFile, 
    currentFile, 
    setOpenFiles, 
    openFiles,
    deleteFile // <--- Receive the function
}) => {
    return (
        <div className="explorer h-full min-w-[250px] max-w-[300px] bg-slate-900 border-r border-slate-800 flex flex-col">
            <div className="header bg-slate-800 p-2 border-b border-slate-700">
                <p className='text-slate-300 font-semibold text-sm pl-2'>EXPLORER</p>
            </div>
            
            <div className="file-tree w-full overflow-auto">
                {Object.keys(fileTree).map((file, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setCurrentFile(file)
                            setOpenFiles([...new Set([...openFiles, file])])
                        }}
                        className={`tree-element cursor-pointer p-2 px-4 flex items-center justify-between gap-2 w-full text-left transition-colors group
                            ${currentFile === file ? 'bg-slate-800 border-l-4 border-blue-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <i className="ri-file-code-line text-lg"></i>
                            <p className='font-medium text-sm'>{file}</p>
                        </div>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation() // Prevent opening the file when clicking delete
                                if(window.confirm(`Are you sure you want to delete ${file}?`)) {
                                    deleteFile(file)
                                }
                            }}
                            className='opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-700 text-red-500 transition-all'
                        >
                            <i className="ri-delete-bin-line"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FileTree