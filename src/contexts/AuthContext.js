import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInExtension, setIsInExtension] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Check if running in Chrome extension iframe
    const inIframe = window.self !== window.top;
    setIsInExtension(inIframe);
    
    if (inIframe) {
      // Listen for messages from extension
      window.addEventListener('message', handleExtensionMessage);
      
      // Notify extension that frontend is ready
      window.parent.postMessage({ type: 'LINKIFY_READY' }, '*');
    }
    
    return () => {
      if (inIframe) {
        window.removeEventListener('message', handleExtensionMessage);
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('linkify_token');
      if (!token) {
        setLoading(false);
        return;
      }

      apiService.setAuthToken(token);
      const response = await apiService.verifyAuth();
      
      if (response.data.valid) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('linkify_token');
        apiService.setAuthToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('linkify_token');
      apiService.setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle messages from Chrome extension
  const handleExtensionMessage = async (event) => {
    if (event.data.type === 'RESTORE_AUTH') {
      const { auth, accountDomain } = event.data;
      if (auth && auth.token) {
        localStorage.setItem('linkify_token', auth.token);
        apiService.setAuthToken(auth.token);
        setUser(auth.user);
      }
    } else if (event.data.type === 'EXTENSION_AUTH_TOKEN') {
      // Handle auth token from OAuth completed in new tab
      const token = event.data.token;
      console.log('Processing auth token from extension:', token);
      
      try {
        // Set token and verify auth
        localStorage.setItem('linkify_token', token);
        apiService.setAuthToken(token);
        
        const userResponse = await apiService.verifyAuth();
        
        if (userResponse.data.valid) {
          const userData = userResponse.data.user;
          setUser(userData);
          
          // Extract account domain
          const accountDomain = userData.email ? 
            userData.email.split('@')[1] : 
            userData.accountDomain || '';
          
          // Notify extension of successful auth
          notifyExtensionAuth(token, userData, accountDomain);
        }
      } catch (error) {
        console.error('Error processing extension auth token:', error);
      }
    }
  };

  // Notify extension when user logs in
  const notifyExtensionAuth = (token, userData, accountDomain) => {
    if (isInExtension && window.parent) {
      window.parent.postMessage({
        type: 'LINKIFY_AUTH_SUCCESS',
        auth: { token, user: userData },
        accountDomain: accountDomain
      }, '*');
    }
  };

  const login = (token) => {
    localStorage.setItem('linkify_token', token);
    apiService.setAuthToken(token);
    checkAuthStatus();
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('linkify_token');
      apiService.setAuthToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    isInExtension,
    notifyExtensionAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};