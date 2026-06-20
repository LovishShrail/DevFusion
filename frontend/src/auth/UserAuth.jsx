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
        return <div>Loading...</div>
    }


    return (
        <>
            {children}</>
    )
}

export default UserAuth