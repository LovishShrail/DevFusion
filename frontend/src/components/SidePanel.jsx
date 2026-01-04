import React from 'react'

const SidePanel = ({ isSidePanelOpen, setIsSidePanelOpen, users }) => {
    return (
        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-900 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 z-10 border-r border-slate-800`}>
            
            {/* Header */}
            <header className='flex justify-between items-center px-4 p-3 bg-slate-800 border-b border-slate-700'>
                <h1 className='font-semibold text-lg text-white'>Collaborators</h1>
                <button 
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                    className='p-2 text-slate-400 hover:text-white transition-colors'
                >
                    <i className="ri-close-fill text-xl"></i>
                </button>
            </header>

            {/* Users List */}
            <div className="users flex flex-col gap-2 p-2">
                {users && users.map(user => (
                    <div 
                        key={user._id} 
                        className="user cursor-pointer hover:bg-slate-800 p-2 flex gap-2 items-center rounded-md transition-colors"
                    >
                        <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-700 relative'>
                            <i className="ri-user-fill absolute"></i>
                        </div>
                        <div className="flex flex-col">
                            <h1 className='font-semibold text-lg text-slate-200'>{user.email}</h1>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SidePanel