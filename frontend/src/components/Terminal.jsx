import React, { useEffect, useRef } from 'react'
import { Terminal as XTerminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

// We use forwardRef so the Parent (Project.jsx) can write to this terminal
const Terminal = React.forwardRef((props, ref) => {
    const terminalRef = useRef(null)

    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new XTerminal({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 12,
            fontFamily: '"Fira Code", "Cascadia Code", monospace',
            theme: {
                background: '#000a1a',
                foreground: '#94a3b8',
                cursor: '#34fcff',
                cursorAccent: '#000a1a',
                selectionBackground: '#1e40af40',
                black: '#0f172a',
                red: '#f87171',
                green: '#4ade80',
                yellow: '#fbbf24',
                blue: '#60a5fa',
                magenta: '#c084fc',
                cyan: '#34fcff',
                white: '#e2e8f0',
            },
            rows: 10,
            cols: 80,
            scrollback: 1000,
            allowTransparency: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        term.open(terminalRef.current);
        
        // Fix for layout timing
        setTimeout(() => {
            fitAddon.fit();
        }, 50);

        term.writeln('\x1b[36m❯\x1b[0m Terminal ready\r\n');
        
        // Expose the terminal instance to the parent via the ref
        if (ref) {
            ref.current = term
        }

        return () => {
            term.dispose();
        }
    }, [])

    return (
        <div className="h-full flex flex-col">
            {/* Terminal header */}
            <div className="h-8 flex items-center px-3 bg-[#000a1a] border-b border-white/[0.04] shrink-0 select-none gap-2">
                <i className="ri-terminal-box-line text-[10px] text-lagoon-spark/50"></i>
                <span className="text-[10px] text-slate-600 tracking-widest uppercase font-medium">Terminal</span>
            </div>
            <div 
                ref={terminalRef} 
                className="flex-1 overflow-hidden bg-[#000a1a]" 
                id="terminal" 
            />
        </div>
    )
})

export default Terminal