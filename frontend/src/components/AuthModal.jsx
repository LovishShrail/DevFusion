import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true) // Toggle between Login/Register
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { setUser } = useContext(UserContext)
    const navigate = useNavigate()

    if (!isOpen) return null

    const submitHandler = (e) => {
        e.preventDefault()
        const endpoint = isLogin ? '/users/login' : '/users/register'

        axios.post(endpoint, { email, password })
            .then((res) => {
                setUser(res.data.user)
                navigate('/home') // Redirect to dashboard
            })
            .catch((err) => {
                console.log(err.response?.data || "Error occurred")
                alert("Authentication failed. Please check credentials.")
            })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose} // Close when clicking outside
            ></div>

            {/* Modal Content */}
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-md p-8 rounded-2xl shadow-2xl transform transition-all scale-100 animate-fadeIn">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <i className="ri-close-line text-2xl"></i>
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex p-1 bg-slate-800 rounded-lg mb-6">
                        <button 
                            onClick={() => setIsLogin(true)}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => setIsLogin(false)}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Register
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        {isLogin ? 'Enter your credentials to access your workspace.' : 'Join us and start building the future today.'}
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <div className="relative">
                            <i className="ri-mail-line absolute left-3 top-3 text-slate-500"></i>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <div className="relative">
                            <i className="ri-lock-password-line absolute left-3 top-3 text-slate-500"></i>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 mt-4"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AuthModal