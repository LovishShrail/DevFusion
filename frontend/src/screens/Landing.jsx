import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AuthModal from '../components/AuthModal'
import logo from '../assets/logo.png'

const Landing = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const canvasRef = useRef(null)

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
        <div className="h-full w-full overflow-y-auto bg-midnight-ink text-white font-sauce selection:bg-lagoon-spark selection:text-midnight-ink no-scrollbar scroll-smooth">

            {/* Premium Deep Background Ambient Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-deep-blue-static/15 rounded-full blur-[160px]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-lagoon-spark/5 rounded-full blur-[160px]"></div>
            </div>

            {/* Persistent Top Bar Header */}
            <nav className="relative z-20 flex justify-between items-center px-8 py-4 max-w-7xl mx-auto border-b border-white/5 font-sauce">
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
                        className="text-slate-shadow hover:text-arctic-mist cursor-pointer transition-colors font-medium text-xs font-sauce tracking-wider uppercase"
                    >
                        Sign In
                    </button>
                    {/* Filled Navy Action Button */}
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="bg-deep-blue-static text-arctic-mist px-6 py-2.5 rounded-default font-medium hover:bg-deep-blue-static/85 cursor-pointer transition-all transform hover:scale-105 font-sauce shadow-lg shadow-deep-blue-static/25 text-xs tracking-wider uppercase"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 -mt-20 relative overflow-hidden">

                {/* Interactive Sphere Canvas background */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-100"
                />

                {/* Floating Mock Data Badges with dynamic cursor scaling & neon glow-backs */}
                {/* Badge 1: AI Agent status */}
                <div className="absolute top-[18%] left-[6%] md:left-[15%] p-4 bg-midnight-ink/80 backdrop-blur-md border border-slate-shadow/20 rounded-cards shadow-2xl z-10 select-none max-w-[200px] text-left hover:border-lagoon-spark/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-lagoon-spark/10 cursor-pointer animate-fadeIn hidden sm:block">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-lagoon-spark/20 flex items-center justify-center text-lagoon-spark">
                            <i className="ri-robot-2-line text-xs"></i>
                        </div>
                        <span className="text-[9px] font-mono tracking-widest text-slate-shadow uppercase">AI Partner</span>
                    </div>
                    <p className="text-[11px] text-arctic-mist font-sauce leading-normal mb-1">Refactoring sidebar logic...</p>
                    <span className="text-[9px] font-mono tracking-widest text-lagoon-spark uppercase">Code compiled</span>
                </div>

                {/* Badge 2: Sync Logs */}
                <div className="absolute top-[52%] left-[4%] md:left-[10%] p-4 bg-midnight-ink/80 backdrop-blur-md border border-slate-shadow/20 rounded-cards shadow-2xl z-10 select-none max-w-[215px] text-left hover:border-lagoon-spark/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-lagoon-spark/10 cursor-pointer animate-fadeIn hidden md:block">
                    <div className="text-[9px] font-mono tracking-widest text-slate-shadow uppercase mb-3">Sync Operations</div>
                    <div className="space-y-2 text-[10px] font-sauce">
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-slate-shadow">Socket Handshake</span>
                            <span className="text-lagoon-spark font-mono">100% OK</span>
                        </div>
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-slate-shadow">FileTree Hydrated</span>
                            <span className="text-slate-shadow font-mono">Active</span>
                        </div>
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-slate-shadow">VM Sandbox Mounted</span>
                            <span className="text-slate-shadow font-mono">Local</span>
                        </div>
                    </div>
                </div>

                {/* Badge 3: Sandbox Terminal */}
                <div className="absolute bottom-[18%] right-[8%] p-4 bg-midnight-ink/80 backdrop-blur-md border border-slate-shadow/20 rounded-cards shadow-2xl z-10 select-none max-w-[230px] text-left hover:border-lagoon-spark/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-lagoon-spark/10 cursor-pointer animate-fadeIn hidden sm:block">
                    <div className="text-[9px] font-mono tracking-widest text-lagoon-spark uppercase mb-2">Sandbox Terminal</div>
                    <div className="flex items-center justify-between gap-6 mb-3">
                        <span className="text-[10px] text-arctic-mist font-mono bg-steel-gray/25 px-2 py-0.5 rounded-default">npm run build</span>
                        <span className="text-[9px] text-slate-shadow font-mono">Exit Code: 0</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-sauce gap-4">
                        <div>
                            <span className="text-slate-shadow block text-[9px]">CPU Load</span>
                            <span className="text-arctic-mist font-semibold">12%</span>
                        </div>
                        <div>
                            <span className="text-slate-shadow block text-[9px]">Sandbox Memory</span>
                            <span className="text-arctic-mist font-semibold">154 MB</span>
                        </div>
                    </div>
                </div>

                {/* Badge 4: VM Container Status */}
                <div className="absolute top-[28%] right-[6%] md:right-[15%] p-4 bg-midnight-ink/80 backdrop-blur-md border border-slate-shadow/20 rounded-cards shadow-2xl z-10 select-none max-w-[190px] text-left hover:border-lagoon-spark/60 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-lagoon-spark/10 cursor-pointer animate-fadeIn hidden sm:block">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-lagoon-spark animate-pulse"></div>
                        <span className="text-[9px] font-mono tracking-widest text-slate-shadow uppercase">Server VM</span>
                    </div>
                    <p className="text-[11px] text-arctic-mist font-sauce leading-normal mb-1">WebContainer Ready</p>
                    <span className="text-[9px] font-mono tracking-widest text-slate-shadow uppercase">Port 5173 &rarr; Staging OK</span>
                </div>

                {/* Main Hero Elements - Upgraded with premium text gradient & highlight accents */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-f37 font-extralight tracking-tight mb-6 bg-gradient-to-b from-white via-arctic-mist to-arctic-mist/75 bg-clip-text text-transparent max-w-4xl leading-[1.1] select-none z-10">
                    Integrate, automate <br /> and <span className="font-semibold bg-gradient-to-r from-lagoon-spark via-lagoon-spark to-deep-blue-static bg-clip-text text-transparent hover:scale-105 transition-transform inline-block duration-300">elevate</span> your workspace
                </h1>

                <p className="text-xs md:text-sm text-slate-shadow/95 max-w-xl mb-8 leading-relaxed font-sauce z-10">
                    Dev Fusion monitors and synchronizes thousands of code updates,
                    scaffolds developer <span className="text-lagoon-spark font-mono font-medium">file trees</span>, and surfaces real-time <span className="text-lagoon-spark font-mono font-medium">socket connections</span>—increasing engineering speeds by <span className="text-white font-semibold">10x</span>.
                </p>

                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-8 py-3 bg-deep-blue-static hover:bg-deep-blue-static/85 text-arctic-mist rounded-default font-semibold text-xs tracking-wider uppercase shadow-lg shadow-deep-blue-static/30 transition-all transform hover:scale-105 hover:shadow-lagoon-spark/15 hover:border-lagoon-spark/30 z-10 mb-16 cursor-pointer"
                >
                    Start Coding Now
                </button>
            </main>

            {/* Section 2: Proactive workspace management details */}
            <section className="relative z-10 py-24 bg-[#00052e]/55 border-t border-slate-shadow/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-f37 font-light tracking-tight text-arctic-mist mb-6">
                        From reactive to proactive <br /> workspace management
                    </h2>
                    <p className="text-xs md:text-sm text-slate-shadow max-w-lg mx-auto mb-16 font-sauce leading-relaxed">
                        Say goodbye to broken local setups, lost terminal configs, and delayed code integrations.
                        Dev Fusion bridges the gap between client VM compilation and real-time developer sync.
                    </p>

                    {/* Visual 3-Column Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                num: '01',
                                icon: 'ri-command-line',
                                title: 'Blueprint Clarity',
                                desc: 'Every component, file tree structure, and environment variable is rendered in clear visual layouts, keeping layouts clean and logical.'
                            },
                            {
                                num: '02',
                                icon: 'ri-cpu-line',
                                title: 'WebContainer Execution',
                                desc: 'Spawn complete Node.js environments locally inside the browser. Compile, test, and run code sandbox builds with total separation and zero latency.'
                            },
                            {
                                num: '03',
                                icon: 'ri-radar-line',
                                title: 'Active Synchronization',
                                desc: 'Broadcast real-time code changes to collaborators immediately over low-latency socket layers, preventing stale branch updates.'
                            }
                        ].map((card, i) => (
                            <div key={i} className="group p-8 bg-midnight-ink border border-slate-shadow/15 rounded-cards hover:border-lagoon-spark/45 transition-all duration-300 text-left shadow-xl hover:shadow-lagoon-spark/3">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-10 h-10 bg-steel-gray/15 rounded-default flex items-center justify-center text-lagoon-spark border border-slate-shadow/25 group-hover:bg-deep-blue-static group-hover:text-white transition-colors">
                                        <i className={`${card.icon} text-lg`}></i>
                                    </div>
                                    <span className="text-xs font-mono tracking-widest text-slate-shadow uppercase">{card.num}</span>
                                </div>
                                <h4 className="text-lg font-f37 font-semibold text-arctic-mist mb-3 group-hover:text-lagoon-spark transition-colors">{card.title}</h4>
                                <p className="text-slate-shadow text-xs leading-relaxed font-sauce">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 3: Technical Statistics Panel */}
            <section className="relative z-10 py-20 bg-transparent border-t border-slate-shadow/15">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '0ms', label: 'Keystroke Latency' },
                            { value: '99.9%', label: 'Sandbox Uptime' },
                            { value: '1.2s', label: 'VMS boot speeds' },
                            { value: '10x', label: 'Engineering speeds' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <span className="text-4xl md:text-5xl font-mono tracking-wider font-semibold text-lagoon-spark font-plex">{stat.value}</span>
                                <span className="text-[10px] font-mono tracking-widest text-slate-shadow uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 4: Premium Monospace Footer */}
            <footer className="relative z-10 py-16 bg-[#00052e] border-t border-slate-shadow/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 select-none text-left">
                    <div className="col-span-full md:col-span-1 mb-6 md:mb-0">
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src={logo}
                                alt="Dev Fusion Logo"
                                className="h-17 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                            />
                        </div>
                        <p className="text-[11px] text-slate-shadow leading-relaxed font-sauce">
                            Midnight command center for synchronized engineering and sandbox client-side execution.
                        </p>
                    </div>

                    {[
                        { title: 'Command', items: ['IDE Terminal', 'Collaborators', 'WebContainer API', 'LLM Agents'] },
                        { title: 'Platform', items: ['Enterprise Security', 'Custom Integrations', 'Changelogs', 'System Status'] },
                        { title: 'Legal', items: ['Terms of Use', 'Privacy Policy', 'Data Compliance', 'SLA Terms'] }
                    ].map((col, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <span className="text-[10px] font-mono tracking-widest text-lagoon-spark uppercase mb-1">{col.title}</span>
                            {col.items.map((item, idx) => (
                                <span key={idx} className="text-[11px] text-slate-shadow hover:text-arctic-mist cursor-pointer transition-colors font-sauce">{item}</span>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-slate-shadow/15 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
                    <span className="text-[10px] font-mono text-slate-shadow">© 2026 Dev Fusion Inc. All rights reserved.</span>
                    <div className="flex gap-4 text-slate-shadow text-sm">
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