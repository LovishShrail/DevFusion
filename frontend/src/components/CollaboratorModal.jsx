import React, { useState } from 'react'

const CollaboratorModal = ({ 
    isModalOpen, 
    setIsModalOpen, 
    users, 
    selectedUserId, 
    handleUserClick, 
    addCollaborators 
}) => {
    const [searchQuery, setSearchQuery] = useState('')

    if (!isModalOpen) return null

    // Filter users dynamically by username or email (robust optional-chaining to support legacy records)
    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const emailMatch = user.email?.toLowerCase().includes(query);
        const usernameMatch = user.username?.toLowerCase().includes(query);
        return emailMatch || usernameMatch;
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4 select-none">
            
            <div className="bg-[#000a30] p-6 rounded-2xl shadow-2xl shadow-black/40 border border-white/[0.08] w-[400px] max-w-full relative overflow-hidden animate-fadeIn pb-20">
                
                {/* Header */}
                <header className='flex justify-between items-center mb-5'>
                    <h2 className='text-lg font-semibold text-white tracking-tight'>Add Collaborators</h2>
                    <button 
                        onClick={() => {
                            setSearchQuery('');
                            setIsModalOpen(false);
                        }} 
                        className='p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]'
                    >
                        <i className="ri-close-line text-lg"></i>
                    </button>
                </header>

                {/* Search */}
                <div className="mb-4 relative">
                    <i className="ri-search-2-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                    <input 
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-lagoon-spark/40 focus:ring-1 focus:ring-lagoon-spark/20 transition-all"
                    />
                </div>

                {/* Users */}
                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                    {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-600 text-[12px]">
                            <i className="ri-search-eye-line text-2xl mb-2 opacity-40"></i>
                            <span>No matching users</span>
                        </div>
                    ) : (
                        filteredUsers.map(user => {
                        const isSelected = selectedUserId.has(user._id);
                        return (
                            <div 
                                key={user._id} 
                                className={`cursor-pointer p-3 flex gap-3 items-center rounded-xl border transition-all group ${
                                    isSelected 
                                        ? 'bg-lagoon-spark/8 border-lagoon-spark/20' 
                                        : "bg-white/[0.02] border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                                }`}
                                onClick={() => handleUserClick(user._id)}
                            >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ring-1 ${
                                    isSelected 
                                        ? 'bg-lagoon-spark/15 text-lagoon-spark ring-lagoon-spark/25' 
                                        : 'bg-white/[0.06] text-slate-500 group-hover:text-slate-300 ring-white/[0.06]'
                                }`}>
                                    <i className="ri-user-3-fill text-xs"></i>
                                    {isSelected && (
                                        <div className="absolute -bottom-0.5 -right-0.5 bg-lagoon-spark rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-[#000a30]">
                                            <i className="ri-check-line text-[8px] text-[#000a30] font-bold"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className={`font-medium text-[13px] transition-colors truncate ${isSelected ? 'text-lagoon-spark' : 'text-slate-300 group-hover:text-white'}`}>
                                        {user?.username || user?.email?.split('@')[0] || 'Unknown'}
                                    </h4>
                                    <span className="text-slate-600 text-[10px] truncate font-mono">{user?.email || ''}</span>
                                </div>
                            </div>
                        )
                    }))}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-[#000a30]/95 border-t border-white/[0.06] backdrop-blur-md flex justify-center">
                    <button
                        onClick={addCollaborators}
                        disabled={selectedUserId.size === 0}
                        className={`w-full py-2.5 rounded-xl font-semibold text-[13px] transition-all transform active:scale-[0.98] ${
                            selectedUserId.size > 0
                                ? 'bg-deep-blue-static hover:bg-deep-blue-static/85 text-white shadow-lg shadow-deep-blue-static/20'
                                : 'bg-white/[0.04] text-slate-600 cursor-not-allowed border border-white/[0.06]'
                        }`}>
                        Add {selectedUserId.size > 0 ? selectedUserId.size : ''} Collaborator{selectedUserId.size !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CollaboratorModal