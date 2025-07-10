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
      // The API call now uses the token from localStorage via an interceptor.
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // This will fail if the token is invalid or not present.
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
      // loginUser now handles storing the token in localStorage
      const data = await loginUser(email, password);
      if (data.status === 'success') {
        // Set the user in our state after successful login and token storage.
        setUser(data.data.user);
      }
      return data;
    } catch (error) {
      // If login fails, ensure user state is null and token is cleared.
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout(); // This now clears localStorage and can optionally hit a server endpoint.
      setUser(null); // Clear the user from our state
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the API call fails, we must ensure the user is logged out on the frontend.
      localStorage.removeItem('token');
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