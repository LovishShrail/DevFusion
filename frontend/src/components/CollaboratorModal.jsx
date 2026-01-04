import React from 'react'

const CollaboratorModal = ({ 
    isModalOpen, 
    setIsModalOpen, 
    users, 
    selectedUserId, 
    handleUserClick, 
    addCollaborators 
}) => {
    if (!isModalOpen) return null

    return (
        // 1. Backdrop with Blur and dark overlay
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all p-4">
            
            {/* 2. Modal Container - Dark theme styling */}
            <div className="bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-800 w-96 max-w-full relative overflow-hidden animate-fadeIn">
                
                {/* Header */}
                <header className='flex justify-between items-center mb-6'>
                    <h2 className='text-xl font-bold text-white'>Select User</h2>
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className='p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800'
                    >
                        <i className="ri-close-fill text-xl"></i>
                    </button>
                </header>

                {/* Users List */}
                {/* Added custom scrollbar styling for dark mode */}
                <div className="users-list flex flex-col gap-3 mb-20 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
                    {users.map(user => {
                        const isSelected = selectedUserId.has(user._id);
                        return (
                            <div 
                                key={user._id} 
                                // 3. Dynamic classes for selection state and hover effects
                                className={`user cursor-pointer p-3 flex gap-4 items-center rounded-lg border transition-all group ${
                                    isSelected 
                                        ? 'bg-blue-900/30 border-blue-500/50' 
                                        : "bg-slate-800/50 border-transparent hover:bg-slate-800 hover:border-slate-700"
                                }`}
                                onClick={() => handleUserClick(user._id)}
                            >
                                <div className={`aspect-square relative rounded-full w-12 h-12 flex items-center justify-center text-xl transition-colors ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 group-hover:text-slate-300'
                                }`}>
                                    <i className="ri-user-fill absolute"></i>
                                    {/* Optional: Add a checkmark if selected */}
                                    {isSelected && (
                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900">
                                            <i className="ri-check-line text-xs text-white"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h1 className={`font-semibold text-lg transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                                        {user.email.split('@')[0]} {/* Display name part before @ */}
                                    </h1>
                                    <small className="text-slate-500 text-xs">{user.email}</small>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer Action Button */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md flex justify-center">
                    <button
                        onClick={addCollaborators}
                        disabled={selectedUserId.size === 0}
                        className={`px-8 py-3 rounded-lg font-semibold text-sm transition-all transform active:scale-95 ${
                            selectedUserId.size > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}>
                        Add {selectedUserId.size > 0 ? selectedUserId.size : ''} Collaborator{selectedUserId.size !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CollaboratorModal