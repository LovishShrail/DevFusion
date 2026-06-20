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
        <main className='h-full overflow-auto text-comet relative selection:bg-celestial-light/30 selection:text-ghost-white'>
            {/* Ambient atmospheric glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] bg-neon-violet/5 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-celestial-light/3 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 p-8 max-w-6xl mx-auto font-sans">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-display font-medium tracking-tight text-ghost-white">Your Workspaces</h2>
                        <p className="text-[13px] text-whisper-blue mt-1">Manage and access your collaborative environments</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-neon-violet hover:bg-neon-violet/85 text-ghost-white px-5 py-2.5 rounded-pill font-semibold transition-all text-[13px] flex items-center gap-2 shadow-lg shadow-neon-violet/20 active:scale-[0.98] cursor-pointer"
                    >
                        <i className="ri-add-line text-base"></i> New Project
                    </button>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {project.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center h-80 glassy-card border-dashed">
                            <div className="w-16 h-16 rounded-cards bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 text-whisper-blue">
                                <i className="ri-folder-add-line text-2xl"></i>
                            </div>
                            <p className="text-whisper-blue text-[14px] mb-5 font-sans">No workspaces found. Initialize one now.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-neon-violet hover:bg-neon-violet/85 text-ghost-white px-6 py-2.5 rounded-pill font-semibold transition-all text-[13px] shadow-lg shadow-neon-violet/25 cursor-pointer"
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
                                className="group cursor-pointer p-5 glassy-card hover:border-celestial-light/40 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 flex flex-col gap-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-badges flex items-center justify-center text-whisper-blue group-hover:bg-neon-violet group-hover:text-ghost-white transition-all">
                                        <i className="ri-code-box-line text-lg"></i>
                                    </div>
                                    <div className="text-whisper-blue group-hover:text-ghost-white transition-colors">
                                        <i className="ri-arrow-right-up-line text-base"></i>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-display font-medium text-ghost-white mb-1 group-hover:text-celestial-light transition-colors">{proj.name}</h3>
                                    <p className="text-[11px] text-whisper-blue">Active session</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-whisper-blue text-[11px] mt-auto font-sans">
                                    <i className="ri-group-line text-celestial-light/50 text-xs"></i> 
                                    <span>{proj.users.length} Member{proj.users.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
                    <div className="login-card p-8 w-full max-w-md relative animate-fadeIn">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-display font-medium text-ghost-white">Create Workspace</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-whisper-blue hover:text-ghost-white transition-colors p-1 rounded-lg hover:bg-white/[0.06] cursor-pointer">
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={createProject}>
                            <div className="mb-5">
                                <label className="block text-[12px] font-medium text-arctic-mist mb-1.5 font-sans">Workspace Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" 
                                    className="w-full p-4 input-minimal text-[13px] font-sans" 
                                    placeholder="e.g. My Next-Gen App"
                                    required 
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" className="btn-pill-secondary px-5 py-2 text-[12px] font-semibold cursor-pointer" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-solid-primary px-5 py-2 text-[12px] font-semibold cursor-pointer">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home