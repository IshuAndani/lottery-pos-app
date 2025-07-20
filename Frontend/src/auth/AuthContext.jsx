import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { loginUser, logoutUser as apiLogout, getCurrentUser } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth check

  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('jwt');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      console.log('Attempting to log in with:', { email, password });
      const data = await loginUser(email, password);
      console.log('Login response:', data);
      if (data.status === 'success') {
        // Store token in localStorage (already done in loginUser)
        setUser(data.data.user);
      }
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout(); // Removes token from localStorage
      setUser(null); // Clear the user from our state
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading, // Expose loading state for UI
  };

  // Don't render children until we've checked for a logged-in user to prevent UI flicker
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;