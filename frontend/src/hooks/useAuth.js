import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, refresh_token, user: userData } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(userData);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const loginWithGitHub = async () => {
    try {
      // Get authorization URL from backend with proper state handling
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const response = await api.get(`/auth/github/login?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (response.data && response.data.authorization_url) {
        // Store state in localStorage for verification
        if (response.data.state) {
          localStorage.setItem('oauth_state', response.data.state);
        }
        
        // Redirect to GitHub OAuth
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error initiating GitHub login:', error);
      toast.error('Failed to initiate GitHub authentication');
    }
  };

  const handleGitHubCallback = async (code, state) => {
    try {
      // Verify state parameter for CSRF protection (optional since backend also validates)
      const storedState = localStorage.getItem('oauth_state');
      if (storedState && state && storedState !== state) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }
      
      // Clear stored state
      localStorage.removeItem('oauth_state');
      
      // Send both code and state to backend for validation
      const params = new URLSearchParams({ code });
      if (state) {
        params.append('state', state);
      }
      
      const response = await api.get(`/auth/github/callback?${params.toString()}`);
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(user);
      toast.success('GitHub authentication successful!');
      
      return { success: true, user };
    } catch (error) {
      console.error('GitHub auth callback error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Authentication failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshToken = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) throw new Error('No refresh token');
      
      const response = await api.post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${refresh_token}` }
      });
      
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithGitHub,
    handleGitHubCallback,
    logout,
    refreshToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 