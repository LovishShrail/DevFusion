import React from 'react'

const SidePanel = ({ isSidePanelOpen, setIsSidePanelOpen, users, setIsModalOpen }) => {
    return (
        <div className={`w-full h-full flex flex-col bg-slate-950 absolute transition-all duration-300 ease-in-out ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 z-20 border-r border-white/5`}>
            
            {/* Header */}
            <header className='flex justify-between items-center px-4 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm'>
                <h2 className='font-medium text-sm text-slate-300 flex items-center gap-2'>
                    <i className="ri-group-fill text-blue-500"></i>
                    Project Members
                </h2>
                <button 
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                    className='p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors'
                >
                    <i className="ri-close-line text-lg"></i>
                </button>
            </header>

            {/* Users List */}
            <div className="flex-grow overflow-y-auto p-2 flex flex-col gap-1 no-scrollbar">
                
                {/* Check if users exist */}
                {users && users.length > 0 ? (
                    users.map(user => (
                        <div 
                            key={user._id} 
                            className="group cursor-pointer hover:bg-slate-800/50 p-2 flex gap-3 items-center rounded-lg transition-all border border-transparent hover:border-white/5"
                        >
                            {/* Avatar */}
                            <div className='w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-600/20 transition-colors shrink-0 border border-white/5'>
                                <i className="ri-user-3-fill text-sm"></i>
                            </div>

                            {/* User Info */}
                            <div className="flex flex-col min-w-0">
                                <h3 className='font-medium text-sm text-slate-200 truncate group-hover:text-white transition-colors'>
                                    {user.email}
                                </h3>
                                {/* Optional: Add status or role here later */}
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Collaborator</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                        <i className="ri-ghost-line text-2xl mb-2 opacity-50"></i>
                        <p className="text-xs">No members yet</p>
                    </div>
                )}

            </div>

            {/* Footer (Optional actions) */}
            <div className="p-3 border-t border-white/5 bg-slate-900/30">
                <button 
                    onClick={() => {
                        setIsSidePanelOpen(false); // Close the side panel
                        setIsModalOpen(true);
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium transition-colors border border-white/5"
                >
                    Add More Members
                </button>
            </div>
        </div>
    )
}

export default SidePanel