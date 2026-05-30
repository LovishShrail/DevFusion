import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthModal from '../components/AuthModal'

const Landing = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    return (
        <div className="h-full w-full overflow-auto bg-slate-950 text-white font-inter selection:bg-blue-500 selection:text-white">
            {/* Background Glow Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <i className="ri-code-s-slash-line text-xl"></i>
                    </div>
                    <span className="text-xl font-bold tracking-tight">AI Code IDE</span>
                </div>
                <div className="flex gap-6">
                    <button 
                        onClick={() => setIsAuthModalOpen(true)} 
                        className="text-slate-300 hover:text-white transition-colors"
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-white text-slate-900 px-5 py-2 rounded-full font-medium hover:bg-slate-200 transition-colors"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center text-center mt-20 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full mb-8 animate-fadeIn">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-slate-400">v2.0 is now live with real-time collaboration</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-500 text-transparent bg-clip-text max-w-4xl leading-tight">
                    The Future of <br/> AI-Powered Coding
                </h1>
                
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
                    Experience a seamless development environment where AI writes, debugs, and deploys your code. 
                    Real-time collaboration meets intelligent automation.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105"
                    >
                        Start Coding for Free
                    </button>
    
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full px-4 mb-20">
                    {[
                        { icon: 'ri-speed-line', title: 'Lightning Fast', desc: 'Instant feedback and execution with our optimized WebContainers.' },
                        { icon: 'ri-openai-fill', title: 'AI Assistant', desc: 'Built-in AI that understands your codebase and helps you write better code.' },
                        { icon: 'ri-group-line', title: 'Real-time Collab', desc: 'Code with your team in real-time with zero latency sync.' }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors text-left backdrop-blur-sm">
                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-blue-500">
                                <i className={`${feature.icon} text-2xl`}></i>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-slate-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </div>
    )
}

export default Landing