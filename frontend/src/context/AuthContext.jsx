import { createContext, useContext, useEffect } from 'react';
import api from '../api/axios.js';
import useAuthStore from '../store/authStore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { isAuthenticated, updateUser, logout } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) return;
        api.get('/auth/me').then(({ data }) => updateUser(data.user)).catch(() => logout());
    }, []);

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
