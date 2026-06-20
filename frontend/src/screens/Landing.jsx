import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import logo from '../assets/logo.png'

const Landing = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)
    const canvasRef = useRef(null)

    // IntersectionObserver scroll reveal system
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    const handleScroll = (e) => {
        const target = e.currentTarget;
        const pct = (target.scrollTop / (target.scrollHeight - target.offsetHeight)) * 100;
        setScrollProgress(pct);
    };

    // Interactive 3D Particle Sphere System
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animationFrameId

        let width = canvas.width = canvas.offsetWidth
        let height = canvas.height = canvas.offsetHeight

        const handleResize = () => {
            if (!canvas) return
            width = canvas.width = canvas.offsetWidth
            height = canvas.height = canvas.offsetHeight
        }
        window.addEventListener('resize', handleResize)

        // Generate 3D Spherical Particles (Increased density & size for maximum visual excellence)
        const particles = []
        const particleCount = 1400
        const radius = Math.min(width, height) * 0.28

        for (let i = 0; i < particleCount; i++) {
            // Fibonacci Sphere distribution
            const theta = Math.acos(1 - 2 * (i / particleCount))
            const phi = Math.PI * (1 + Math.sqrt(5)) * i

            particles.push({
                x3d: radius * Math.sin(theta) * Math.cos(phi),
                y3d: radius * Math.sin(theta) * Math.sin(phi),
                z3d: radius * Math.cos(theta),
                baseSize: Math.random() * 2.5 + 1.2
            })
        }

        let baseAngleX = 0.0015
        let baseAngleY = 0.0025
        let currentSpeedX = 0.0015
        let currentSpeedY = 0.0025
        let mouse = { x: 0, y: 0 }
        let hasMoved = false

        const handleMouseMove = (e) => {
            hasMoved = true
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left - width / 2
            mouse.y = e.clientY - rect.top - height / 2
        }
        window.addEventListener('mousemove', handleMouseMove)

        const render = () => {
            if (!ctx) return
            ctx.clearRect(0, 0, width, height)

            // Draw dynamic background cursor glow spotlight
            if (hasMoved) {
                const mouseAbsX = mouse.x + width / 2
                const mouseAbsY = mouse.y + height / 2
                const glowGrad = ctx.createRadialGradient(mouseAbsX, mouseAbsY, 0, mouseAbsX, mouseAbsY, 220)
                glowGrad.addColorStop(0, 'rgba(52, 252, 255, 0.045)')
                glowGrad.addColorStop(0.4, 'rgba(4, 40, 203, 0.015)')
                glowGrad.addColorStop(1, 'rgba(0, 5, 46, 0)')

                ctx.fillStyle = glowGrad
                ctx.beginPath()
                ctx.arc(mouseAbsX, mouseAbsY, 220, 0, Math.PI * 2)
                ctx.fill()
            }

            // Draw deep glowing orbit background rings
            ctx.strokeStyle = 'rgba(4, 40, 203, 0.04)'
            ctx.lineWidth = 1
            for (let r = 60; r < radius * 1.6; r += 70) {
                ctx.beginPath()
                ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2)
                ctx.stroke()
            }

            // Influence speeds by mouse coordinate with smooth dampening
            const targetSpeedX = baseAngleX + mouse.y * 0.000008
            const targetSpeedY = baseAngleY + mouse.x * 0.000008
            currentSpeedX += (targetSpeedX - currentSpeedX) * 0.06
            currentSpeedY += (targetSpeedY - currentSpeedY) * 0.06

            const cosX = Math.cos(currentSpeedX)
            const sinX = Math.sin(currentSpeedX)
            const cosY = Math.cos(currentSpeedY)
            const sinY = Math.sin(currentSpeedY)

            const projected = []

            particles.forEach(p => {
                // Rotation X
                let y1 = p.y3d * cosX - p.z3d * sinX
                let z1 = p.z3d * cosX + p.y3d * sinX

                // Rotation Y
                let x2 = p.x3d * cosY - z1 * sinY
                let z2 = z1 * cosY + p.x3d * sinY

                p.x3d = x2
                p.y3d = y1
                p.z3d = z2

                // 3D projection map
                const distance = 400
                const scale = distance / (distance + z2)
                let projX = x2 * scale + width / 2
                let projY = y1 * scale + height / 2

                // Interactive gravity/displacement force around cursor position
                const mouseAbsX = mouse.x + width / 2
                const mouseAbsY = mouse.y + height / 2
                if (hasMoved) {
                    const dx = projX - mouseAbsX
                    const dy = projY - mouseAbsY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 180) {
                        const force = (180 - dist) / 180
                        const repelStrength = force * 26
                        projX += (dx / (dist || 1)) * repelStrength
                        projY += (dy / (dist || 1)) * repelStrength
                    }
                }

                projected.push({
                    x: projX,
                    y: projY,
                    z: z2,
                    size: p.baseSize * scale * 1.6,
                    alpha: Math.max(0.28, Math.min(0.95, (z2 + radius) / (radius * 2) * 1.3))
                })
            })

            // Draw fine connecting mesh lines (increased connection density for premium aesthetic)
            ctx.strokeStyle = 'rgba(52, 252, 255, 0.07)'
            ctx.lineWidth = 0.6
            for (let i = 0; i < projected.length; i += 3) {
                ctx.beginPath()
                ctx.moveTo(projected[i].x, projected[i].y)
                const nextIdx = (i + 1) % projected.length
                ctx.lineTo(nextIdx.x, nextIdx.y)
                ctx.stroke()

                // Extra multi-dimensional crystalline lattice connections
                if (i % 9 === 0) {
                    ctx.beginPath()
                    ctx.moveTo(projected[i].x, projected[i].y)
                    const farIdx = (i + 37) % projected.length
                    ctx.lineTo(projected[farIdx].x, projected[farIdx].y)
                    ctx.strokeStyle = 'rgba(52, 252, 255, 0.035)'
                    ctx.stroke()
                }
            }

            // Draw glowing magnetic connection lines from cursor to close-range particles
            if (hasMoved) {
                const mouseAbsX = mouse.x + width / 2
                const mouseAbsY = mouse.y + height / 2
                ctx.beginPath()
                let threadsCount = 0
                for (let i = 0; i < projected.length; i += 2) {
                    const p = projected[i]
                    const dx = p.x - mouseAbsX
                    const dy = p.y - mouseAbsY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 130) {
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(mouseAbsX, mouseAbsY)
                        threadsCount++
                        if (threadsCount > 60) break // performance safeguard
                    }
                }
                ctx.strokeStyle = 'rgba(52, 252, 255, 0.08)'
                ctx.lineWidth = 0.45
                ctx.stroke()
            }

            // Draw glowing particles (amplified visibility & glow)
            projected.forEach(p => {
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2)
                grad.addColorStop(0, `rgba(52, 252, 255, ${p.alpha})`)
                grad.addColorStop(0.25, `rgba(4, 40, 203, ${p.alpha * 0.65})`)
                grad.addColorStop(1, 'rgba(0, 5, 46, 0)')

                ctx.fillStyle = grad
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size * 4.0, 0, Math.PI * 2)
                ctx.fill()
            })

            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <div onScroll={handleScroll} className="h-full w-full overflow-y-auto bg-midnight-abyss text-comet font-sans selection:bg-celestial-light/30 selection:text-ghost-white no-scrollbar scroll-smooth relative">

            {/* Top fixed scroll progress indicator */}
            <div 
                className="fixed top-0 left-0 h-[2.5px] bg-gradient-to-r from-neon-violet via-celestial-light to-neon-violet z-[999] transition-all duration-75" 
                style={{ width: `${scrollProgress}%` }}
            />

            {/* Premium Deep Background Ambient Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-neon-violet/5 rounded-full blur-[160px]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-celestial-light/3 rounded-full blur-[160px]"></div>
            </div>

            {/* Persistent Top Bar Header */}
            <nav className="relative z-20 flex justify-between items-center px-8 py-4 max-w-7xl mx-auto border-b border-white/5 font-sans">
                <div className="flex items-center gap-3 select-none group cursor-pointer">
                    <img
                        src={logo}
                        alt="Dev Fusion Logo"
                        className="h-19 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    />
                </div>

                <div className="flex gap-6 items-center">
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-whisper-blue hover:text-ghost-white cursor-pointer transition-colors font-medium text-xs font-display tracking-wider uppercase"
                    >
                        Sign In
                    </button>
                    {/* Filled Navy Action Button */}
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="btn-pill-primary text-ghost-white px-6 py-2.5 rounded-pill font-medium cursor-pointer transition-all transform hover:scale-105 shadow-lg shadow-white/5 text-xs tracking-wider uppercase"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 -mt-20 overflow-hidden select-none">

                {/* Interactive Sphere Canvas background */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-100"
                />

                {/* Floating Mock Data Badges with stagger reveal delays */}
                {/* Badge 1: AI Agent status */}
                <div 
                    style={{ transitionDelay: '100ms' }}
                    className="scroll-reveal absolute top-[18%] left-[6%] md:left-[15%] p-4 glassy-card z-10 max-w-[200px] text-left hover:border-celestial-light/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-celestial-light/10 cursor-pointer hidden sm:block"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-celestial-light/10 flex items-center justify-center text-celestial-light">
                            <i className="ri-robot-2-line text-xs"></i>
                        </div>
                        <span className="text-[9px] font-mono tracking-widest text-whisper-blue uppercase">AI Partner</span>
                    </div>
                    <p className="text-[11px] text-ghost-white font-sans leading-normal mb-1">Refactoring sidebar logic...</p>
                    <span className="text-[9px] font-mono tracking-widest text-celestial-light uppercase font-semibold">Code compiled</span>
                </div>

                {/* Badge 2: Sync Logs */}
                <div 
                    style={{ transitionDelay: '250ms' }}
                    className="scroll-reveal absolute top-[52%] left-[4%] md:left-[10%] p-4 glassy-card z-10 max-w-[215px] text-left hover:border-celestial-light/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-celestial-light/10 cursor-pointer hidden md:block"
                >
                    <div className="text-[9px] font-mono tracking-widest text-whisper-blue uppercase mb-3">Sync Operations</div>
                    <div className="space-y-2 text-[10px] font-sans">
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-whisper-blue">Socket Handshake</span>
                            <span className="text-celestial-light font-mono font-semibold">100% OK</span>
                        </div>
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-whisper-blue">FileTree Hydrated</span>
                            <span className="text-whisper-blue font-mono">Active</span>
                        </div>
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-whisper-blue">VM Sandbox Mounted</span>
                            <span className="text-whisper-blue font-mono">Local</span>
                        </div>
                    </div>
                </div>

                {/* Badge 3: Sandbox Terminal */}
                <div 
                    style={{ transitionDelay: '400ms' }}
                    className="scroll-reveal absolute bottom-[18%] right-[8%] p-4 glassy-card z-10 max-w-[230px] text-left hover:border-celestial-light/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-celestial-light/10 cursor-pointer hidden sm:block"
                >
                    <div className="text-[9px] font-mono tracking-widest text-celestial-light uppercase mb-2">Sandbox Terminal</div>
                    <div className="flex items-center justify-between gap-6 mb-3">
                        <span className="text-[10px] text-ghost-white font-mono bg-storm-gray/25 px-2 py-0.5 rounded-default">npm run build</span>
                        <span className="text-[9px] text-whisper-blue font-mono">Exit Code: 0</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-sans gap-4">
                        <div>
                            <span className="text-whisper-blue block text-[9px]">CPU Load</span>
                            <span className="text-ghost-white font-semibold">12%</span>
                        </div>
                        <div>
                            <span className="text-whisper-blue block text-[9px]">Sandbox Memory</span>
                            <span className="text-ghost-white font-semibold">154 MB</span>
                        </div>
                    </div>
                </div>

                {/* Badge 4: VM Container Status */}
                <div 
                    style={{ transitionDelay: '550ms' }}
                    className="scroll-reveal absolute top-[20%] right-[6%] md:right-[14%] p-4 glassy-card z-10 max-w-[190px] text-left hover:border-celestial-light/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-celestial-light/10 cursor-pointer hidden sm:block"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-celestial-light animate-pulse"></div>
                        <span className="text-[9px] font-mono tracking-widest text-whisper-blue uppercase">Server VM</span>
                    </div>
                    <p className="text-[11px] text-ghost-white font-sans leading-normal mb-1">WebContainer Ready</p>
                    <span className="text-[9px] font-mono tracking-widest text-whisper-blue uppercase">Port 5173 &rarr; Staging OK</span>
                </div>

                {/* Main Hero Elements - Upgraded with premium text gradient & highlight accents */}
                <h1 className="scroll-reveal text-4xl md:text-6xl lg:text-7xl font-display font-light tracking-tight mb-6 bg-gradient-to-b from-white via-arctic-mist to-arctic-mist/75 bg-clip-text text-transparent max-w-4xl leading-[1.1] z-10">
                    Collaborate, code, <br /> and run servers <span className="font-semibold bg-gradient-to-r from-celestial-light via-celestial-light to-neon-violet bg-clip-text text-transparent hover:scale-105 transition-transform inline-block duration-300">in browser</span>
                </h1>

                <p className="scroll-reveal text-xs md:text-sm text-whisper-blue max-w-2xl mb-8 leading-relaxed font-sans z-10" style={{ transitionDelay: '150ms' }}>
                    A collaborative WebAssembly-powered workspace. Create secure <span className="text-celestial-light font-mono font-medium">collaborative rooms</span>, prompt our integrated <span className="text-celestial-light font-mono font-medium">Gemini AI Assistant</span> to generate entire apps, and run complete Node.js servers locally in your browser using secure <span className="text-ghost-white font-semibold">WebContainers</span>.
                </p>

                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    style={{ transitionDelay: '300ms' }}
                    className="scroll-reveal btn-solid-primary rounded-pill font-semibold text-xs tracking-wider uppercase shadow-lg shadow-neon-violet/30 transition-all transform hover:scale-105 hover:shadow-celestial-light/15 z-10 mb-16 cursor-pointer"
                >
                    Start Coding Now
                </button>

                {/* Looping Mouse Scroll Indicator */}
                {scrollProgress < 12 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none animate-bounce opacity-70 z-20 font-mono">
                        <span className="text-[9px] tracking-widest text-whisper-blue uppercase">Scroll Down</span>
                        <div className="w-5 h-8 border border-whisper-blue/30 rounded-pill flex justify-center p-1.5">
                            <div className="w-1.5 h-1.5 bg-celestial-light rounded-full animate-scrollIndicator"></div>
                        </div>
                    </div>
                )}
            </main>

            {/* Section 2: Proactive workspace management details */}
            <section className="relative z-10 py-24 bg-midnight-abyss border-t border-white/[0.04]">
                <div className="max-w-7xl mx-auto px-8 text-center">
                    <h2 className="scroll-reveal text-3xl md:text-5xl font-display font-light tracking-tight text-ghost-white mb-6">
                        An all-in-one developer environment <br /> inside a single tab
                    </h2>
                    <p className="scroll-reveal text-xs md:text-sm text-whisper-blue max-w-lg mx-auto mb-16 font-sans leading-relaxed" style={{ transitionDelay: '150ms' }}>
                        Say goodbye to broken local setups, heavy node_modules on disk, and lost synchronization. Dev Fusion integrates chat, real-time code sharing, AI coding partners, and server compilers in one tab.
                    </p>

                    {/* Visual 3-Column Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                num: '01',
                                icon: 'ri-group-line',
                                title: 'Collaborative Chat Rooms',
                                desc: 'Create secure developer spaces with real-time text chat and instant code synchronization over low-latency Socket.io layers. Perfect for live pair programming.'
                            },
                            {
                                num: '02',
                                icon: 'ri-robot-2-line',
                                title: 'Gemini AI Assistant',
                                desc: 'Interact with an expert AI developer directly inside the chat. Tag @ai to auto-generate entire full-stack file trees, Express backends, React configs, or CRUD scripts.'
                            },
                            {
                                num: '03',
                                icon: 'ri-terminal-box-line',
                                title: 'WebContainer Execution',
                                desc: 'Boot absolute micro-operating systems and run full-stack Node.js servers in your browser. Install npm packages, view live preview frames, and manage ports with a click.'
                            }
                        ].map((card, i) => (
                            <div 
                                key={i} 
                                style={{ transitionDelay: `${i * 150}ms` }}
                                className="scroll-reveal group p-8 glassy-card text-left hover:border-celestial-light/45 transition-all duration-300"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-10 h-10 bg-storm-gray/15 rounded-default flex items-center justify-center text-celestial-light border border-white/[0.06] group-hover:bg-neon-violet group-hover:text-ghost-white transition-colors">
                                        <i className={`${card.icon} text-lg`}></i>
                                    </div>
                                    <span className="text-xs font-mono tracking-widest text-whisper-blue uppercase">{card.num}</span>
                                </div>
                                <h4 className="text-lg font-display font-medium text-ghost-white mb-3 group-hover:text-celestial-light transition-colors">{card.title}</h4>
                                <p className="text-whisper-blue text-xs leading-relaxed font-sans">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 3: Technical Statistics Panel */}
            <section className="relative z-10 py-20 bg-transparent border-t border-white/[0.04]">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '0ms', label: 'Keystroke Sync Latency' },
                            { value: '100%', label: 'In-Browser Execution' },
                            { value: '< 1.5s', label: 'WebContainer Boot Time' },
                            { value: '10x', label: 'Engineering Output' }
                        ].map((stat, i) => (
                            <div 
                                key={i} 
                                style={{ transitionDelay: `${i * 100}ms` }}
                                className="scroll-reveal flex flex-col gap-2"
                            >
                                <span className="text-4xl md:text-5xl font-mono tracking-wider font-semibold text-celestial-light font-plex">{stat.value}</span>
                                <span className="text-[10px] font-mono tracking-widest text-whisper-blue uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 4: Premium Monospace Footer */}
            <footer className="relative z-10 py-16 bg-[#05060f] border-t border-white/[0.04] backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 select-none text-left">
                    <div className="col-span-full md:col-span-1 mb-6 md:mb-0">
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src={logo}
                                alt="Dev Fusion Logo"
                                className="h-17 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                            />
                        </div>
                        <p className="text-[11px] text-whisper-blue leading-relaxed font-sans">
                            Midnight command center for synchronized engineering and sandbox client-side execution.
                        </p>
                    </div>

                    {[
                        { title: 'Command', items: ['IDE Terminal', 'Collaborators', 'WebContainer API', 'LLM Agents'] },
                        { title: 'Platform', items: ['Enterprise Security', 'Custom Integrations', 'Changelogs', 'System Status'] },
                        { title: 'Legal', items: ['Terms of Use', 'Privacy Policy', 'Data Compliance', 'SLA Terms'] }
                    ].map((col, i) => (
                        <div key={i} className="flex flex-col gap-3 font-sans">
                            <span className="text-[10px] font-mono tracking-widest text-celestial-light uppercase mb-1">{col.title}</span>
                            {col.items.map((item, idx) => (
                                <span key={idx} className="text-[11px] text-whisper-blue hover:text-ghost-white cursor-pointer transition-colors">{item}</span>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
                    <span className="text-[10px] font-mono text-whisper-blue">© 2026 Dev Fusion Inc. All rights reserved.</span>
                    <div className="flex gap-4 text-whisper-blue text-sm">
                        <i className="ri-github-fill hover:text-white cursor-pointer transition-colors"></i>
                        <i className="ri-twitter-x-fill hover:text-white cursor-pointer transition-colors"></i>
                        <i className="ri-discord-fill hover:text-white cursor-pointer transition-colors"></i>
                    </div>
                </div>
            </footer>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    )
}

export default Landing