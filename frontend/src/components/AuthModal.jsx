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
            <div className="relative bg-[#000a30] border border-white/[0.08] w-full max-w-md p-8 rounded-2xl shadow-2xl shadow-black/40 animate-fadeIn z-10">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]">
                    <i className="ri-close-line text-xl"></i>
                </button>

                <div className="text-center mb-8">
                    {/* Toggle Pill */}
                    <div className="inline-flex p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-6 select-none">
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`px-6 py-2 rounded-lg text-[12px] font-semibold transition-all ${isLogin ? 'bg-deep-blue-static text-white shadow-lg shadow-deep-blue-static/25' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`px-6 py-2 rounded-lg text-[12px] font-semibold transition-all ${!isLogin ? 'bg-deep-blue-static text-white shadow-lg shadow-deep-blue-static/25' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Register
                        </button>
                    </div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 text-[13px] mt-1.5">
                        {isLogin ? 'Enter your credentials to access your workspace.' : 'Join us and start building the future today.'}
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Username</label>
                            <div className="relative">
                                <i className="ri-user-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-30 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-lagoon-spark/40 focus:ring-1 focus:ring-lagoon-spark/20 transition-all text-[13px] placeholder-slate-600"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Email Address</label>
                        <div className="relative">
                            <i className="ri-mail-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-30 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-lagoon-spark/40 focus:ring-1 focus:ring-lagoon-spark/20 transition-all text-[13px] placeholder-slate-600"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Password</label>
                        <div className="relative">
                            <i className="ri-lock-password-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-30 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-lagoon-spark/40 focus:ring-1 focus:ring-lagoon-spark/20 transition-all text-[13px] placeholder-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-deep-blue-static hover:bg-deep-blue-static/85 text-white font-semibold rounded-xl shadow-lg shadow-deep-blue-static/25 transition-all transform active:scale-[0.98] mt-6 text-[13px]"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AuthModal