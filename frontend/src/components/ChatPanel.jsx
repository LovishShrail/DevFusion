import React, { useRef, useEffect } from 'react'
import Markdown from 'markdown-to-jsx'
import SyntaxHighlightedCode from './SyntaxHighlightedCode'

const ChatPanel = ({
    isSidePanelOpen,
    setIsSidePanelOpen,
    setIsModalOpen,
    messages,
    user,
    message,
    setMessage,
    send,
    isAiTyping
}) => {
    const messageBox = useRef(null)

    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scroll({
                top: messageBox.current.scrollHeight,
                behavior: 'smooth' 
            })
        }
    }, [messages,isAiTyping])

    const WriteAiMessage = (msg) => {
        const messageObject = JSON.parse(msg)
        return (
            <div className='overflow-auto text-white rounded-sm p-2'>
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>
        )
    }

    return (
        <section className="relative flex flex-col h-full w-full bg-slate-950 ">
            
            {/* 1. Glass Header */}
            {/* Header: Actions aligned to the right */}
            <header className='flex justify-end items-center px-4 py-3 absolute top-0 left-0 w-full z-10 border-b border-white/5 bg-slate-900/50 backdrop-blur-md'>
                
                <div className="flex items-center gap-2">
                    
                    {/* Secondary Button: View Team */}
                    <button 
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                        className={`p-1.5 px-3 rounded-md text-sm transition-all flex items-center gap-1.5 font-medium
                            ${isSidePanelOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                        `}
                    >
                        <i className="ri-group-line"></i>
                        <span className="hidden md:inline">Team</span>
                    </button>

                    {/* Primary Button: Add Member */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-all shadow-lg shadow-blue-500/20'
                    >
                        <i className="ri-user-add-line"></i>
                        <span>Add Member</span>
                    </button>

                </div>
            </header>
            {/* 2. Chat Area */}
            <div className="flex-grow pt-20 pb-24 px-4 overflow-y-auto no-scrollbar" ref={messageBox}>
                <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                    {messages.map((msg, index) => {
                        const isUser = msg.sender._id === (user._id || user.id);
                        const isAi = msg.sender._id === 'ai';

                        return (
                            <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAi ? 'bg-white' : 'bg-slate-800'}`}>
                                    {isAi ? <i className="ri-robot-2-line text-black text-sm"></i> : <i className="ri-user-3-fill text-slate-400 text-sm"></i>}
                                </div>

                                {/* Message Bubble */}
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm border ${
                                    isUser 
                                        ? 'bg-blue-600 text-white border-blue-500 rounded-tr-sm' 
                                        : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-sm'
                                }`}>
                                    {!isUser && <span className='text-xs text-slate-500 block mb-2 font-mono'>{msg.sender.email}</span>}
                                    <div className='text-sm leading-relaxed'>
                                        {isAi ? WriteAiMessage(msg.message) : <p>{msg.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* AI Loading Bubble */}
                    {isAiTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                <i className="ri-robot-2-line text-black text-sm"></i>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-2xl rounded-tl-sm border border-slate-800 flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Floating Input Area */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl glass p-2 rounded-xl shadow-2xl z-20">
                <div className="relative flex items-end gap-2 bg-slate-950/50 rounded-lg border border-slate-800 p-0.8">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        placeholder="Type your message..."
                        className="w-full bg-transparent text-slate-200 text-sm p-3 outline-none resize-none max-h-32 min-h-[44px]"
                        rows={1}
                    />
                    <button 
                        onClick={send}
                        className={`p-2 rounded-md transition-all flex-shrink-0 ${
                            message.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        <i className="ri-arrow-up-line text-lg"></i>
                    </button>
                </div>
            </div>
        </section>
    )
}

export default ChatPanel