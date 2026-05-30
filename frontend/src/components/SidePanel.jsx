import React from 'react'

const SidePanel = ({ isSidePanelOpen, setIsSidePanelOpen, users, setIsModalOpen }) => {
    return (
        <div className={`w-full h-full flex flex-col bg-[#000620] absolute transition-all duration-300 ease-out ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 z-20 border-r border-white/[0.06]`}>
            
            {/* Header */}
            <header className='flex justify-between items-center px-4 h-11 shrink-0 border-b border-white/[0.06] bg-[#000a35]/60 select-none'>
                <h2 className='font-medium text-[12px] text-slate-300 flex items-center gap-2'>
                    <i className="ri-group-fill text-lagoon-spark/70 text-sm"></i>
                    <span>Team Members</span>
                </h2>
                <button 
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                    className='p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all'
                >
                    <i className="ri-close-line text-sm"></i>
                </button>
            </header>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5 no-scrollbar">
                
                {users && users.length > 0 ? (
                    users.map(user => (
                        <div 
                            key={user._id} 
                            className="group p-2.5 flex gap-3 items-center rounded-lg transition-all hover:bg-white/[0.04] select-none"
                        >
                            {/* Avatar */}
                            <div className='w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-500 group-hover:text-lagoon-spark group-hover:bg-lagoon-spark/10 transition-all shrink-0 ring-1 ring-white/[0.06]'>
                                <i className="ri-user-3-fill text-[11px]"></i>
                            </div>

                            {/* User Info */}
                            <div className="flex flex-col min-w-0">
                                <h3 className='font-medium text-[12px] text-slate-300 truncate group-hover:text-white transition-colors'>
                                    {user?.username || user?.email?.split('@')[0] || 'Unknown'}
                                </h3>
                                <span className="text-[10px] text-slate-600 truncate font-mono">{user?.email || ''}</span>
                            </div>

                            {/* Online indicator */}
                            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400/50 shrink-0"></div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-600">
                        <i className="ri-ghost-line text-xl mb-2 opacity-40"></i>
                        <p className="text-[11px]">No members yet</p>
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.06] shrink-0 select-none">
                <button 
                    onClick={() => {
                        setIsSidePanelOpen(false);
                        setIsModalOpen(true);
                    }}
                    className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.1] text-slate-400 hover:text-white rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                    <i className="ri-user-add-line text-xs"></i>
                    <span>Add Members</span>
                </button>
            </div>
        </div>
    )
}

export default SidePanel