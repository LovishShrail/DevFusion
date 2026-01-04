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
    send
}) => {
    const messageBox = useRef(null)

    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight
        }
    }, [messages])

    const WriteAiMessage = (msg) => {
        const messageObject = JSON.parse(msg)
        return (
            <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
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
        <section className="left relative flex flex-col h-full bg-slate-300">
            <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-800 text-slate-200 border-b border-slate-700 absolute z-10 top-0'>
                <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
                    <i className="ri-add-fill mr-1"></i>
                    <p>Add collaborator</p>
                </button>
                <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                    <i className="ri-group-fill"></i>
                </button>
            </header>

            <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
                <div
                    ref={messageBox}
                    className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
                    {messages.map((msg, index) => (
                        <div key={msg._id || index} className={`${msg.sender._id === 'ai' ? 'max-w-[80%] bg-slate-800 text-white' : 'max-w-[70%]'} ${msg.sender._id === (user._id || user.id) && 'ml-auto'} message flex flex-col p-2 bg-blue-600 text-white w-fit rounded-md`}>
                            <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                            <div className='text-sm'>
                                {msg.sender._id === 'ai' ?
                                    WriteAiMessage(msg.message)
                                    : <p>{msg.message}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="inputField w-full flex absolute bottom-0">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                send();
                            }
                        }}
                        className='p-2 px-4 border-none outline-none flex-grow bg-slate-900 text-white border-t border-slate-700' type="text" 
                        placeholder='Enter message' />
                    <button
                        onClick={send}
                        className='px-5 bg-slate-950 text-white'><i className="ri-send-plane-fill"></i></button>
                </div>
            </div>
        </section>
    )
}

export default ChatPanel