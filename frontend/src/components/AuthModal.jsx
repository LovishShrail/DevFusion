import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { setUser } = useContext(UserContext)
    const navigate = useNavigate()

    if (!isOpen) return null

    const submitHandler = (e) => {
        e.preventDefault()
        const endpoint = isLogin ? '/users/login' : '/users/register'
        const payload = isLogin ? { email, password } : { username, email, password }

        axios.post(endpoint, payload)
            .then((res) => {
                setUser(res.data.user)
                navigate('/home')
            })
            .catch((err) => {
                console.log(err.response?.data || "Error occurred")
                alert("Authentication failed. Please check credentials.")
            })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative login-card w-full max-w-md p-8 animate-fadeIn z-10">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-whisper-blue hover:text-ghost-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]">
                    <i className="ri-close-line text-xl"></i>
                </button>

                <div className="text-center mb-8">
                    {/* Toggle Pill */}
                    <div className="inline-flex p-1 bg-white/2 border border-white/6 rounded-xl mb-6 select-none">
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`px-6 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${isLogin ? 'bg-neon-violet text-ghost-white shadow-lg shadow-neon-violet/25' : 'text-whisper-blue hover:text-arctic-mist'}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`px-6 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${!isLogin ? 'bg-neon-violet text-ghost-white shadow-lg shadow-neon-violet/25' : 'text-whisper-blue hover:text-arctic-mist'}`}
                        >
                            Register
                        </button>
                    </div>
                    <h2 className="text-2xl font-display font-medium text-ghost-white tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-whisper-blue text-[13px] mt-1.5 font-sans">
                        {isLogin ? 'Enter your credentials to access your workspace.' : 'Join us and start building the future today.'}
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-4 font-sans">
                    {!isLogin && (
                        <div>
                            <label className="block text-[12px] font-medium text-arctic-mist mb-1.5">Username</label>
                            <div className="relative">
                                <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-whisper-blue text-sm"></i>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 input-minimal placeholder-slate-600 text-[13px]"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-[12px] font-medium text-arctic-mist mb-1.5">Email Address</label>
                        <div className="relative">
                            <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-whisper-blue text-sm"></i>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 input-minimal placeholder-slate-600 text-[13px]"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-medium text-arctic-mist mb-1.5">Password</label>
                        <div className="relative">
                            <i className="ri-lock-password-line absolute left-3 top-1/2 -translate-y-1/2 text-whisper-blue text-sm"></i>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 input-minimal placeholder-slate-600 text-[13px]"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 btn-solid-primary cursor-pointer active:scale-[0.98] mt-6 text-[13px]"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AuthModal