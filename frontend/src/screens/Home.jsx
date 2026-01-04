import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState("")
    const [project, setProject] = useState([])

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        console.log({ projectName })

        axios.post('/projects/create', { name: projectName })
            .then((res) => {
                setIsModalOpen(false)
                setProjectName("")
                window.location.reload()
            })
            .catch((error) => console.log(error))
    }

    useEffect(() => {
        axios.get('/projects/all').then((res) => {
            setProject(res.data.projects)
        }).catch(err => console.log(err))
    }, [])

    return (
        <main className='h-full overflow-auto bg-slate-950 text-white font-inter'>

            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-semibold">Your Projects</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                    >
                        <i className="ri-add-line"></i> New Project
                    </button>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center h-96 bg-slate-900 border border-dashed border-slate-700 rounded-xl">
                            <i className="ri-folder-add-line text-6xl text-slate-600 mb-4"></i>
                            <p className="text-slate-400 text-lg mb-4">No projects found. Start building!</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                            >
                                Create Your First Project
                            </button>
                        </div>
                    ) : (
                        project.map((project) => (
                            <div key={project._id}
                                onClick={() => {
                                    navigate(`/project/${project._id}`, {
                                        state: { project }
                                    })
                                }}
                                className="group cursor-pointer p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-colors">
                                        <i className="ri-code-box-line text-xl"></i>
                                    </div>
                                    <div className="text-slate-500 group-hover:text-slate-300">
                                        <i className="ri-arrow-right-up-line"></i>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold mb-1 group-hover:text-blue-400 transition-colors">{project.name}</h2>
                                    <p className="text-sm text-slate-500">Last edited just now</p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm mt-auto">
                                    <i className="ri-user-line"></i> 
                                    <span>{project.users.length} Collaborators</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Logic (Same as before) */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
                    <div className="bg-slate-900 p-6 rounded-xl shadow-2xl w-96 border border-slate-800 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Create New Project</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>
                        <form onSubmit={createProject}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" 
                                    className="w-full p-3 bg-slate-800 text-white border border-slate-700 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                                    placeholder="e.g. My Awesome App"
                                    required 
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md hover:bg-slate-700 border border-slate-700" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-lg shadow-blue-500/20">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home