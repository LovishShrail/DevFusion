import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'

const UserAuth = ({ children }) => {

    const { user, loading } = useContext(UserContext)
    // const [ loading, setLoading ] = useState(true)
    // const token = localStorage.getItem('token')
    const navigate = useNavigate()
    
    useEffect(() => {
        if (!loading && !user) {
            navigate('/')
        }
    }, [user, loading, navigate])

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 select-none">
                {/* Ambient atmospheric glow */}
                <div className="absolute w-[300px] h-[300px] bg-neon-violet/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute w-[200px] h-[200px] bg-celestial-light/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Central loader element */}
                <div className="relative flex items-center justify-center mb-6">
                    {/* Spinning glowing outer rings */}
                    <div className="w-16 h-16 rounded-full border-2 border-white/[0.03] border-t-neon-violet border-b-celestial-light animate-spin"></div>
                    {/* Inner pulsing core */}
                    <div className="absolute w-8 h-8 rounded-full bg-slate-900 border border-white/[0.08] flex items-center justify-center shadow-lg shadow-neon-violet/20">
                        <i className="ri-sparkling-line text-celestial-light text-sm animate-pulse"></i>
                    </div>
                </div>

                {/* Text indicators */}
                <h3 className="text-[13px] font-medium text-ghost-white tracking-widest font-display uppercase animate-pulse mb-1">
                    DevFusion
                </h3>
                <p className="text-[10px] text-whisper-blue/60 font-mono tracking-widest uppercase">
                    Securing Workspace...
                </p>
            </div>
        )
    }


    return (
        <>
            {children}</>
    )
}

export default UserAuth