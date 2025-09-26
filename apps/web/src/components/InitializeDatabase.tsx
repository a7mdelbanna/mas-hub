import React, { useState } from 'react';
import { Database, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';
import { seedUsers } from '../scripts/seedUsers';
import { setupAdminUser } from '../scripts/setupAdminUser';
import { auth } from '../lib/firebase/config';

export function InitializeDatabase() {
  const dispatch = useDispatch();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);

  const handleSeedUsers = async () => {
    setIsSeeding(true);
    try {
      const result = await seedUsers();
      if (result) {
        dispatch(addNotification({
          type: 'success',
          title: 'Database Seeded',
          message: 'Sample users have been added successfully',
        }));
      } else {
        dispatch(addNotification({
          type: 'info',
          title: 'Seed Skipped',
          message: 'Users already exist in the database',
        }));
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Seed Failed',
        message: error.message || 'Failed to seed database',
      }));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSetupAdmin = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      dispatch(addNotification({
        type: 'error',
        title: 'Not Authenticated',
        message: 'Please sign in first',
      }));
      return;
    }

    setIsSettingAdmin(true);
    try {
      const result = await setupAdminUser(currentUser.uid);
      if (result) {
        dispatch(addNotification({
          type: 'success',
          title: 'Admin Setup Complete',
          message: 'Your account now has admin privileges. Please refresh the page.',
        }));
        // Reload the page to apply new permissions
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        dispatch(addNotification({
          type: 'error',
          title: 'Setup Failed',
          message: 'Failed to grant admin privileges',
        }));
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Setup Failed',
        message: error.message || 'Failed to setup admin user',
      }));
    } finally {
      setIsSettingAdmin(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Database Initialization
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Use these tools to set up your database with sample data and configure admin permissions.
        </p>
      </div>

      <div className="space-y-4">
        {/* Seed Users */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Seed Sample Users
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Adds 6 sample users with different roles (admin, manager, employee, etc.)
              </p>
              <button
                onClick={handleSeedUsers}
                disabled={isSeeding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Seeding...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Seed Users</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Setup Admin */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Grant Admin Privileges
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Grants super admin privileges to your current account
              </p>
              <button
                onClick={handleSetupAdmin}
                disabled={isSettingAdmin}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
              >
                {isSettingAdmin ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Make Me Admin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Development Only
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              These tools are intended for development and initial setup only. In production, user management should be done through proper admin interfaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}