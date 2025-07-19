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
      // The httpOnly cookie is sent automatically by the browser
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // If this fails, it's okay. It just means the user is not logged in.
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
      const data = await loginUser(email, password);
      if (data.status === 'success') {
        // The cookie is set by the server. We just need to set the user in our state.
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
      await apiLogout(); // Call the API to clear the cookie on the server
      setUser(null); // Clear the user from our state
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, we should log the user out on the frontend
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