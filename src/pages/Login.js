import React from 'react';
import { Chrome, Users, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { isInExtension } = useAuth();
  
  const handleGoogleLogin = () => {
    console.log("handleGoogleLogin started");
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const fullUrl = `${apiUrl}/auth/google`;
    console.log("API URL:", apiUrl);
    console.log("Full URL:", fullUrl);
    console.log("Environment vars:", process.env);
    console.log("Is in extension:", isInExtension);
    
    // Test if backend is reachable first
    console.log("Testing backend connection...");
    fetch(`${apiUrl}/health`)
      .then(response => {
        console.log("Health check response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Health check success:", data);
        console.log("Redirecting to OAuth...");
        
        if (isInExtension) {
          // In extension - open OAuth in new tab
          console.log("Opening OAuth in new tab for extension");
          // Send message to extension to open new tab
          window.parent.postMessage({
            type: 'OPEN_OAUTH_TAB',
            url: fullUrl
          }, '*');
        } else {
          // Normal web app - redirect in same window
          window.location.href = fullUrl;
        }
      })
      .catch(error => {
        console.error("Backend connection failed:", error);
        console.error("Trying OAuth anyway...");
        
        if (isInExtension) {
          window.parent.postMessage({
            type: 'OPEN_OAUTH_TAB',
            url: fullUrl
          }, '*');
        } else {
          window.location.href = fullUrl;
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Features */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-lg">
            <div className="flex items-center mb-8">
              <div className="bg-linkedin-blue p-2 rounded-lg mr-3">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Linkify</h1>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Supercharge Your LinkedIn Prospecting
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              AI-powered Chrome extension that identifies ideal prospects and analyzes 
              company personas for smarter B2B outreach.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                  <Chrome className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Chrome Extension</h3>
                  <p className="text-gray-600">Seamlessly analyze LinkedIn profiles and company pages while browsing</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Persona Identification</h3>
                  <p className="text-gray-600">Discover decision makers, sponsors, influencers, and champions at target companies</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-lg mr-4 mt-1">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Scoring</h3>
                  <p className="text-gray-600">Get instant prospect scores and recommendations powered by LLM analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                <p className="text-gray-600">Sign in to your Linkify account</p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By signing in, you agree to our{' '}
                  <button className="text-blue-600 hover:text-blue-500 underline bg-transparent border-none p-0 cursor-pointer">Terms of Service</button>
                  {' '}and{' '}
                  <button className="text-blue-600 hover:text-blue-500 underline bg-transparent border-none p-0 cursor-pointer">Privacy Policy</button>
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                New to Linkify?{' '}
                <span className="text-blue-600 font-medium">
                  Your account will be created automatically after Google authentication
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;