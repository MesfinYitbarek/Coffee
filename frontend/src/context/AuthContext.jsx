// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Add this line
import API_URL from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // ✅ Add this

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
                    const { data } = await axios.get(`${API_URL}/users/profile`, {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    localStorage.setItem('user', JSON.stringify(data));
                    setUser(data);
                } catch (error) {
                    console.warn('Could not refresh user profile:', error.message);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setUser(null);
                    setToken(null);
                    navigate('/'); // ✅ Redirect to login if token invalid
                }
            }

            setLoading(false);
        };

        loadUserFromStorage();
    }, [navigate]);

    const register = async (userData) => {
        try {
            const { data } = await axios.post(`${API_URL}/users/register`, userData);
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
            const { data } = await axios.post(`${API_URL}/users/login`, credentials);
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

    // ✅ Updated logout function
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        navigate('/'); // ✅ Redirect to login page after logout
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(`${API_URL}/users/profile`, {
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
