import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { Check, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleComplete = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.id), {
        onboardingCompleted: true,
        updatedAt: new Date(),
      });

      const userRoles = user.roles || [];

      if (userRoles.includes('admin') || userRoles.includes('super_admin')) {
        navigate('/admin');
      } else if (userRoles.includes('manager') || userRoles.includes('employee')) {
        navigate('/employee');
      } else if (userRoles.includes('client')) {
        navigate('/client');
      } else if (userRoles.includes('candidate')) {
        navigate('/candidate');
      } else {
        navigate('/employee');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 py-12 text-center">
          <div className="mx-auto h-24 w-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
            <Check className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to MAS Business OS!
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Hi {user.displayName}, we're excited to have you onboard!
          </p>

          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your account is ready
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You now have access to all the tools and features you need to streamline your workflow and boost productivity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✨ Project Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track projects, tasks, and milestones
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Finance Tools</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage invoices, payments, and expenses
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">👥 Team Collaboration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Work together with your team seamlessly
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Analytics & Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gain insights with powerful analytics
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="btn btn-primary flex items-center justify-center mx-auto px-8 py-3 text-lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Need help? Check out our{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              documentation
            </a>
            {' '}or{' '}
            <a href="#" className="text-primary hover:text-primary/80">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}