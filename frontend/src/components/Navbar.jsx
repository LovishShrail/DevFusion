import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

import logo from '../assets/logo.png'

const Navbar = () => {
    const { user } = useContext(UserContext)

    return (
        <header className="flex justify-between items-center px-5 h-14 bg-midnight-abyss/85 border-b border-white/[0.06] shrink-0 backdrop-blur-xl relative z-50 select-none font-sans">
            
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
                <Link to="/home" className="flex items-center gap-2 group">
                    <img
                        src={logo}
                        alt="Dev Fusion"
                        className="h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>

                <Link to="/home" className="flex items-center gap-1.5 text-whisper-blue hover:text-ghost-white transition-colors text-[14px] font-medium font-display">
                    <i className="ri-folder-2-line text-sm"></i>
                    <span>Workspaces</span>
                </Link>
            </div>

            {/* Right: User + Logout */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-lg text-[12px] font-medium text-whisper-blue">
                    <div className="w-5 h-5 rounded-full bg-celestial-light/15 flex items-center justify-center">
                        <i className="ri-user-3-fill text-[9px] text-celestial-light"></i>
                    </div>
                    <span>{user?.username || (user?.email ? user.email.split('@')[0] : 'Guest')}</span>
                </div>

                <button
                    onClick={() => {
                        axios.get('/users/logout')
                            .then(() => {
                                window.location.href = '/';
                            })
                            .catch(err => {
                                console.error("Logout error:", err);
                                window.location.href = '/';
                            });
                    }}
                    className="flex items-center gap-1.5 p-1.5 px-3 btn-pill-secondary text-[12px] font-semibold cursor-pointer py-1"
                    title="Sign out"
                >
                    <i className="ri-logout-box-r-line text-sm"></i>
                    <span>Logout</span>
                </button>
            </div>
        </header>
    )
}

export default Navbar