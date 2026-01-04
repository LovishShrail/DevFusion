import React from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'
import Project from '../screens/Project'
import UserAuth from '../auth/UserAuth'
import Landing from '../screens/Landing'

const AppRoutes = () => {
    return (

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<UserAuth><Home /></UserAuth>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/project/:projectId" element={<UserAuth><Project /></UserAuth>} />
            </Routes>

    )
}

export default AppRoutes