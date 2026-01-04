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
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff',
            },
            rows: 10,
            cols: 80,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        term.open(terminalRef.current);
        
        // Fix for layout timing
        setTimeout(() => {
            fitAddon.fit();
        }, 50);

        term.writeln('Welcome to your AI IDE!');
        
        // Expose the terminal instance to the parent via the ref
        if (ref) {
            ref.current = term
        }

        return () => {
            term.dispose();
        }
    }, [])

    return (
        <div 
            ref={terminalRef} 
            className="max-h-52 min-h-52 bg-[#1e1e1e] overflow-hidden border-t border-slate-700" 
            id="terminal" 
        />
    )
})

export default Terminal