// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // We'll use axios for API calls

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // To check if initial user load is done

    const API_URL = 'http://localhost:5000/api/users'; // Your backend API base URL

    useEffect(() => {
        const loadUserFromStorage = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
                // Optionally, you could try to validate the token with the backend here
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

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};