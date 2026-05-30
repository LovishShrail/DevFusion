import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const Navbar = () => {
    const { user } = useContext(UserContext)

    return (
        <header className="flex justify-between items-center p-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-4">
                <Link to="/home" className="flex items-center gap-2 group">
                    <h1 className="pl-2 text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Dev Fusion</h1>
                </Link>
            </div>

            <div className="flex items-center gap-6">

                <Link to="/home" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <i className="ri-folder-2-line text-lg"></i>
                    <span className="text-sm font-medium">Projects</span>
                </Link>

                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                    <i className="ri-user-smile-line text-blue-500"></i>
                    <span className="text-sm font-medium text-slate-200">{user?.email}</span>
                </div>
                
                <button 
                    onClick={() => {
                        axios.get('/users/logout')
                            .then(() => {
                                localStorage.removeItem('token');
                                window.location.href = '/';
                            })
                            .catch(err => {
                                console.error("Logout error:", err);
                                localStorage.removeItem('token');
                                window.location.href = '/';
                            });
                    }}
                    className="p-2 bg-slate-800 rounded-md text-slate-400 hover:text-white hover:bg-red-600 transition-all"
                >
                    <i className="ri-logout-box-r-line"></i>
                </button>
            </div>
        </header>
    )
}

export default Navbar