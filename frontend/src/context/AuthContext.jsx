// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/users';

    // ✅ Load user and token from localStorage, then refresh from backend
    useEffect(() => {
        const loadUserFromStorage = async () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);

                try {
                    // ✅ Fetch fresh user data from backend
                    const { data } = await axios.get(`${API_URL}/profile`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });

                    // ✅ If backend shows updated status, sync it
                    localStorage.setItem('user', JSON.stringify(data));
                    setUser(data);
                } catch (error) {
                    console.warn('Could not refresh user profile:', error.message);
                    // If token expired or invalid, clear storage
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                }
            }

            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    const register = async (userData) => {
        try {
            const { data } = await axios.post(`${API_URL}/register`, userData);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            setUser(data);
            setToken(data.token);
            return { success: true, message: data.message || 'Registration successful!' };
        } catch (error) {
            console.error('Registration error:', error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || 'Registration failed.' };
        }
    };

    const login = async (credentials) => {
        try {
            const { data } = await axios.post(`${API_URL}/login`, credentials);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            setUser(data);
            setToken(data.token);
            return { success: true, message: 'Login successful!' };
        } catch (error) {
            console.error('Login error:', error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || 'Invalid credentials or account inactive.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };

    // ✅ Optional: Expose a manual refresh function (can be called after payment, etc.)
    const refreshUser = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
        } catch (error) {
            console.error('Manual refresh failed:', error.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
