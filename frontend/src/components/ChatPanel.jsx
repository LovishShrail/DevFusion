import React, { useRef, useEffect } from 'react'
import Markdown from 'markdown-to-jsx'
import SyntaxHighlightedCode from './SyntaxHighlightedCode'

const getDisplayName = (sender) => {
    if (!sender) return 'Unknown';
    if (sender._id === 'ai') return 'AI';
    const name = sender.username || sender.email || 'Unknown';
    if (name.includes('@')) {
        return name.split('@')[0];
    }
    return name;
};

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
    }, [messages, isAiTyping])

    const WriteAiMessage = (msg) => {
        let text = msg;
        try {
            const messageObject = JSON.parse(msg)
            text = messageObject.text;
        } catch (e) {
            console.error("JSON parse failure in rendering AI message:", e);
        }
        return (
            <div className='overflow-auto text-slate-200 rounded-sm p-1'>
                <Markdown
                    children={text}
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
        <section className="relative flex flex-col h-full w-full overflow-hidden">
            
            {/* ── Header Bar ── */}
            <header className='flex justify-between items-center px-4 h-11 shrink-0 border-b border-white/[0.06] bg-midnight-abyss/65 select-none font-display'>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-celestial-light/60 animate-pulse"></div>
                    <span className="font-medium text-[11px] text-whisper-blue tracking-widest uppercase">Chat</span>
                </div>
                <div className="flex items-center gap-1.5">
                    
                    {/* Team Toggle */}
                    <button 
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                        className={`p-1.5 px-2.5 rounded-md text-[11px] transition-all flex items-center gap-1.5 font-medium cursor-pointer
                            ${isSidePanelOpen 
                                ? 'bg-celestial-light/10 text-celestial-light border border-celestial-light/20' 
                                : 'text-whisper-blue hover:text-ghost-white hover:bg-white/[0.04]'}`}
                    >
                        <i className="ri-group-line text-xs"></i>
                        <span>Team</span>
                    </button>

                    {/* Add Member */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className='flex items-center gap-1 px-3 py-1 bg-neon-violet hover:bg-neon-violet/85 text-ghost-white rounded-md text-[11px] font-semibold transition-all cursor-pointer'
                    >
                        <i className="ri-user-add-line text-[10px]"></i>
                        <span>Add</span>
                    </button>

                </div>
            </header>
            
            {/* ── Chat Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar" ref={messageBox}>
                <div className="flex flex-col gap-4 max-w-3xl mx-auto font-sans">
                    {messages.map((msg, index) => {
                        const isUser = msg.sender._id === (user._id || user.id);
                        const isAi = msg.sender._id === 'ai';

                        return (
                            <div key={index} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}>
                                
                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] select-none ${
                                    isAi 
                                        ? 'bg-celestial-light/10 text-celestial-light ring-1 ring-celestial-light/20' 
                                        : 'bg-white/[0.04] text-whisper-blue ring-1 ring-white/[0.06]'
                                }`}>
                                    {isAi ? <i className="ri-sparkling-line"></i> : <i className="ri-user-3-fill text-[10px]"></i>}
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                                    isUser 
                                        ? 'bg-neon-violet text-ghost-white rounded-tr-sm shadow-md' 
                                        : 'bg-white/[0.02] text-comet rounded-tl-sm border border-white/[0.05]'
                                }`}>
                                    {!isUser && <span className='text-[9px] text-whisper-blue block mb-1 font-mono tracking-widest uppercase'>{getDisplayName(msg.sender)}</span>}
                                    <div className='font-sans'>
                                        {isAi ? WriteAiMessage(msg.message) : <p className="whitespace-pre-wrap">{msg.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* AI Typing Indicator */}
                    {isAiTyping && (
                        <div className="flex gap-2.5 animate-fadeIn">
                            <div className="w-7 h-7 rounded-full bg-celestial-light/10 text-celestial-light ring-1 ring-celestial-light/20 flex items-center justify-center shrink-0 text-[11px]">
                                <i className="ri-sparkling-line"></i>
                            </div>
                            <div className="px-4 py-3 bg-white/[0.02] rounded-xl rounded-tl-sm border border-white/[0.05] flex items-center gap-1.5 select-none">
                                <span className="w-1.5 h-1.5 bg-celestial-light/70 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-celestial-light/70 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                <span className="w-1.5 h-1.5 bg-celestial-light/70 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Input Area ── */}
            <div className="shrink-0 px-3 pb-3 pt-1">
                <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-1.5 backdrop-blur-sm shadow-inner">
                    <div className="flex items-end gap-2">
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            placeholder="Message… (use @ai for AI)"
                            className="flex-1 bg-transparent text-ghost-white text-[13px] p-2 outline-none resize-none max-h-28 min-h-[40px] placeholder-whisper-blue/50 leading-relaxed font-sans"
                            rows={1}
                        />
                        <button 
                            onClick={send}
                            disabled={!message.trim()}
                            className={`p-2 rounded-lg transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                                message.trim() 
                                    ? 'bg-neon-violet text-ghost-white hover:bg-neon-violet/85 shadow-lg shadow-neon-violet/20' 
                                    : 'bg-white/[0.04] text-whisper-blue/40 cursor-not-allowed'
                            }`}
                        >
                            <i className="ri-arrow-up-line text-sm font-bold"></i>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ChatPanel