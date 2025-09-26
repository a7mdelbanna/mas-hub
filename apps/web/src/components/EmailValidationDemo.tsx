import React, { useState } from 'react';
import { useEmailValidation } from '../hooks/useEmailValidation';

export function EmailValidationDemo() {
  const [email, setEmail] = useState('');
  const { isValid, isChecking, message, error } = useEmailValidation(email);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Email Validation Demo</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Validation Status */}
        <div className="min-h-[20px]">
          {isChecking && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Checking email availability...
            </div>
          )}

          {!isChecking && message && (
            <div className={`text-sm ${
              isValid === true
                ? 'text-green-600'
                : isValid === false
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Test Emails */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Try these test emails:</p>
          <div className="space-y-1 text-xs">
            <button
              onClick={() => setEmail('test@available.com')}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-green-600"
            >
              test@available.com (Available)
            </button>
            <button
              onClick={() => setEmail('admin@mas.com')}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-red-600"
            >
              admin@mas.com (Already registered)
            </button>
            <button
              onClick={() => setEmail('invalid-email')}
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-red-600"
            >
              invalid-email (Invalid format)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}