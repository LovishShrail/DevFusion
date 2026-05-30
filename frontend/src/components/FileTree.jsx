import React from 'react'

const FileTree = ({ 
    fileTree, 
    setCurrentFile, 
    currentFile, 
    setOpenFiles, 
    openFiles,
    deleteFile
}) => {

    // Get file extension for icon
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
            env: 'ri-settings-3-line',
        };
        return map[ext] || 'ri-file-code-line';
    };

    const getIconColor = (name) => {
        if (!name) return 'text-slate-500';
        const ext = name.split('.').pop()?.toLowerCase();
        const map = {
            js: 'text-yellow-400/60',
            jsx: 'text-cyan-400/60',
            ts: 'text-blue-400/60',
            tsx: 'text-cyan-400/60',
            json: 'text-yellow-500/50',
            css: 'text-blue-400/60',
            html: 'text-orange-400/60',
            md: 'text-slate-400/50',
        };
        return map[ext] || 'text-lagoon-spark/40';
    };

    return (
        <div className="h-full w-[220px] min-w-[180px] max-w-[260px] bg-[#000620]/50 border-r border-white/[0.06] flex flex-col select-none shrink-0">
            
            {/* Header */}
            <div className="h-11 flex items-center px-4 border-b border-white/[0.06] bg-[#000a35]/40 shrink-0">
                <p className='text-slate-500 font-medium text-[10px] tracking-[0.15em] uppercase'>Explorer</p>
            </div>
            
            {/* File List */}
            <div className="flex-1 overflow-auto py-1 no-scrollbar">
                {Object.keys(fileTree).map((file, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setCurrentFile(file)
                            setOpenFiles([...new Set([...openFiles, file])])
                        }}
                        className={`group cursor-pointer flex items-center justify-between px-3 py-[7px] transition-all
                            ${currentFile === file 
                                ? 'bg-white/[0.06] text-white border-l-2 border-lagoon-spark/60' 
                                : 'hover:bg-white/[0.03] text-slate-400 hover:text-slate-200 border-l-2 border-transparent'}`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <i className={`${getFileIcon(file)} text-sm ${currentFile === file ? getIconColor(file).replace('/60', '') : getIconColor(file)} shrink-0`}></i>
                            <p className='text-[12px] font-medium truncate'>{file}</p>
                        </div>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation()
                                if(window.confirm(`Delete ${file}?`)) {
                                    deleteFile(file)
                                }
                            }}
                            className='opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-red-400 transition-all text-[11px] shrink-0'
                            title={`Delete ${file}`}
                        >
                            <i className="ri-delete-bin-6-line"></i>
                        </button>
                    </div>
                ))}

                {Object.keys(fileTree).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                        <i className="ri-folder-open-line text-xl mb-2 opacity-40"></i>
                        <span className="text-[11px]">No files yet</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FileTree