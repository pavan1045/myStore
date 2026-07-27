import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (token) {
                try {
                    const profile = await authService.getProfile();
                    setUser(profile);
                } catch (err) {
                    console.warn('Invalid or expired auth token detected:', err.message);
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [token]);

    const login = async (username, password, inviteToken = null) => {
        const data = await authService.login(username, password, inviteToken);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUser({ username: data.username });
        return { success: true, pendingInvite: data.pendingInvite };
    };

    const signup = async (username, password, inviteToken = null, joinTeam = true) => {
        const data = await authService.signup(username, password, inviteToken, joinTeam);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setToken(data.token);
        setUser({ username: data.username });
        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setToken(null);
        setUser(null);
    };

    const changePassword = async (currentPassword, newPassword) => {
        await authService.changePassword(currentPassword, newPassword);
        return { success: true };
    };

    const updateProfile = async (firstName, lastName) => {
        const profile = await authService.updateProfile(firstName, lastName);
        setUser(profile);
        return profile;
    };

    const deleteAccount = async () => {
        await authService.deleteAccount();
        logout();
        return { success: true };
    };

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        signup,
        logout,
        changePassword,
        updateProfile,
        deleteAccount
    }), [user, token, loading]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
