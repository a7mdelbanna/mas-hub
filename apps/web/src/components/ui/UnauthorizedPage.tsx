import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <ShieldOff className="h-24 w-24 text-red-500 animate-pulse" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          You don't have permission to access this resource. Please login with appropriate credentials.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            ← Go Back
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            🔐 Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}