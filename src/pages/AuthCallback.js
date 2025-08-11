import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, notifyExtensionAuth, isInExtension } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Authentication failed');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          login(token);
          
          // Get user data and account domain
          apiService.setAuthToken(token);
          const userResponse = await apiService.verifyAuth();
          
          if (userResponse.data.valid) {
            const userData = userResponse.data.user;
            
            // Extract account domain from user's email or company info
            const accountDomain = userData.email ? 
              userData.email.split('@')[1] : 
              userData.accountDomain || '';
            
            // Notify extension if running in iframe
            if (isInExtension) {
              notifyExtensionAuth(token, userData, accountDomain);
              // Don't navigate if in extension - let extension handle it
              toast.success('Authentication successful! You can now use the extension.');
            } else {
              toast.success('Welcome to Linkify!');
              navigate('/companies');
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          toast.error('Authentication failed');
          if (!isInExtension) {
            navigate('/login');
          }
        }
      } else {
        toast.error('No authentication token received');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;