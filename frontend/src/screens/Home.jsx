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
        <main className='h-full overflow-auto text-white relative selection:bg-lagoon-spark/30 selection:text-white'>
            {/* Ambient Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] bg-deep-blue-static/8 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-lagoon-spark/4 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 p-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-white">Your Projects</h2>
                        <p className="text-[13px] text-slate-500 mt-1">Manage and access your workspaces</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-deep-blue-static hover:bg-deep-blue-static/85 text-white px-5 py-2.5 rounded-xl font-semibold transition-all text-[13px] flex items-center gap-2 shadow-lg shadow-deep-blue-static/20 active:scale-[0.98]"
                    >
                        <i className="ri-add-line text-base"></i> New Project
                    </button>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {project.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center h-80 bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                                <i className="ri-folder-add-line text-2xl text-slate-600"></i>
                            </div>
                            <p className="text-slate-500 text-[14px] mb-5">No projects yet. Create your first one!</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-5 py-2.5 bg-deep-blue-static hover:bg-deep-blue-static/85 text-white rounded-xl font-semibold transition-all text-[13px] shadow-lg shadow-deep-blue-static/20"
                            >
                                Create Project
                            </button>
                        </div>
                    ) : (
                        project.map((proj) => (
                            <div key={proj._id}
                                onClick={() => {
                                    navigate(`/project/${proj._id}`, {
                                        state: { project: proj }
                                    })
                                }}
                                className="group cursor-pointer p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-lagoon-spark/30 transition-all duration-300 flex flex-col gap-4 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-lagoon-spark/[0.03]"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-2.5 bg-white/[0.05] rounded-xl text-slate-500 group-hover:bg-deep-blue-static/20 group-hover:text-lagoon-spark transition-all border border-white/[0.06]">
                                        <i className="ri-code-box-line text-lg"></i>
                                    </div>
                                    <div className="text-slate-600 group-hover:text-lagoon-spark transition-colors">
                                        <i className="ri-arrow-right-up-line text-base"></i>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-white mb-1 group-hover:text-lagoon-spark transition-colors">{proj.name}</h3>
                                    <p className="text-[11px] text-slate-600">Last edited just now</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-auto">
                                    <i className="ri-group-line text-lagoon-spark/50 text-xs"></i> 
                                    <span>{proj.users.length} Collaborator{proj.users.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-[#000a30] p-6 rounded-2xl shadow-2xl shadow-black/40 w-[400px] border border-white/[0.08] relative animate-fadeIn">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-semibold text-white">New Project</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/[0.06]">
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={createProject}>
                            <div className="mb-5">
                                <label className="block text-[12px] font-medium text-slate-400 mb-1.5">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" 
                                    className="w-full p-3 bg-white/[0.04] text-white border border-white/[0.08] rounded-xl focus:outline-none focus:border-lagoon-spark/40 focus:ring-1 focus:ring-lagoon-spark/20 transition-all text-[13px] placeholder-slate-600" 
                                    placeholder="e.g. My Awesome App"
                                    required 
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-4 py-2 text-slate-400 rounded-lg hover:text-white hover:bg-white/[0.06] transition-all text-[12px] font-medium" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-deep-blue-static hover:bg-deep-blue-static/85 text-white rounded-lg shadow-lg shadow-deep-blue-static/20 text-[12px] font-semibold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home