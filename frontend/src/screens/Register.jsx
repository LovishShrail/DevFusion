import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const Register = () => {

    const [ username, setUsername ] = useState('')
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')

    const { setUser } = useContext(UserContext)

    const navigate = useNavigate()


    function submitHandler(e) {

        e.preventDefault()

        axios.post('/users/register', {
            username,
            email,
            password
        }).then((res) => {
            console.log(res.data)
            // localStorage.setItem('token', res.data.token)
            setUser(res.data.user)
            navigate('/home')
        }).catch((err) => {
            console.log(err.response.data)
        })
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-midnight-ink font-sauce relative overflow-hidden select-none">
            {/* Midnight Glow Gradient Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-deep-blue-static/10 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-lagoon-spark/5 rounded-full blur-[128px]"></div>
            </div>

            <div className="bg-midnight-ink p-8 rounded-cards border border-slate-shadow/20 w-full max-w-md relative z-10 animate-fadeIn shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-2.5 bg-deep-blue-static rounded-default mb-4">
                        <i className="ri-code-s-slash-line text-2xl text-lagoon-spark"></i>
                    </div>
                    <h2 className="text-2xl font-f37 font-medium text-arctic-mist tracking-tight">Register</h2>
                </div>
                <form
                    onSubmit={submitHandler}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-slate-shadow mb-1.5 text-sm" htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            id="username"
                            className="w-full p-3 bg-steel-gray/10 text-white border border-slate-shadow/30 rounded-default focus:outline-none focus:border-lagoon-spark focus:ring-1 focus:ring-lagoon-spark transition-all font-sauce text-sm placeholder-slate-shadow/55"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-shadow mb-1.5 text-sm" htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            className="w-full p-3 bg-steel-gray/10 text-white border border-slate-shadow/30 rounded-default focus:outline-none focus:border-lagoon-spark focus:ring-1 focus:ring-lagoon-spark transition-all font-sauce text-sm placeholder-slate-shadow/55"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-shadow mb-1.5 text-sm" htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            className="w-full p-3 bg-steel-gray/10 text-white border border-slate-shadow/30 rounded-default focus:outline-none focus:border-lagoon-spark focus:ring-1 focus:ring-lagoon-spark transition-all font-sauce text-sm placeholder-slate-shadow/55"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 mt-2 bg-deep-blue-static hover:bg-deep-blue-static/85 text-arctic-mist font-medium rounded-default shadow-lg shadow-deep-blue-static/20 transition-all font-sauce text-sm"
                    >
                        Create Account
                    </button>
                </form>
                <p className="text-slate-shadow text-center text-sm mt-6">
                    Already have an account? <Link to="/login" className="text-lagoon-spark hover:underline font-medium">Login</Link>
                </p>
            </div>
        </div>
    )
}

export default Register