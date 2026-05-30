import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios'; 

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        // Check "Am I logged in?" when the app starts
        axios.get('/users/profile')
            .then(res => {
                setUser(res.data.user);
            })
            .catch(err => {
                console.log("No active session");
                setUser(null);
            })
            .finally(() => {
                // Done checking, allow the UI to render
                setLoading(false);
            });
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};