import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({ id: decoded.id, role: decoded.role });
                fetchUserDetails(decoded.id, decoded.role, token);
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const fetchUserDetails = async (id, role, token) => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserDetails(res.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const login = async (email, password, role) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
                role,
            });
            localStorage.setItem('token', res.data.token);
            const decoded = jwtDecode(res.data.token);
            setUser({ id: res.data.user.id, role: res.data.user.role });
            await fetchUserDetails(res.data.user.id, res.data.user.role, res.data.token);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to login');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setUserDetails(null);
    };

    return (
        <AuthContext.Provider value={{ user, userDetails, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};