import React, { useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase/config';
import { CheckCircle, XCircle, Loader2, Database, User, Shield } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export function TestFirebasePermissions() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    const results: TestResult[] = [];

    // Test 1: Check Authentication
    results.push({ test: 'Authentication Status', status: 'pending' });
    setTests([...results]);

    try {
      const user = auth.currentUser;
      if (user) {
        results[results.length - 1] = {
          test: 'Authentication Status',
          status: 'success',
          message: `Logged in as ${user.email}`,
          data: { uid: user.uid, email: user.email }
        };
      } else {
        results[results.length - 1] = {
          test: 'Authentication Status',
          status: 'error',
          message: 'Not authenticated'
        };
      }
    } catch (error: any) {
      results[results.length - 1] = {
        test: 'Authentication Status',
        status: 'error',
        message: error.message
      };
    }
    setTests([...results]);

    // Test 2: Read Users Collection
    results.push({ test: 'Read Users Collection', status: 'pending' });
    setTests([...results]);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(5));
      const snapshot = await getDocs(q);

      results[results.length - 1] = {
        test: 'Read Users Collection',
        status: 'success',
        message: `Successfully read ${snapshot.size} users`,
        data: snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          name: doc.data().name,
          roles: doc.data().roles
        }))
      };
    } catch (error: any) {
      results[results.length - 1] = {
        test: 'Read Users Collection',
        status: 'error',
        message: error.message
      };
    }
    setTests([...results]);

    // Test 3: Read Current User Profile
    results.push({ test: 'Read Current User Profile', status: 'pending' });
    setTests([...results]);

    try {
      const user = auth.currentUser;
      if (user) {
        const { getDoc, doc } = await import('firebase/firestore');
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          results[results.length - 1] = {
            test: 'Read Current User Profile',
            status: 'success',
            message: 'Successfully read user profile',
            data: {
              name: userData.name,
              roles: userData.roles,
              permissions: userData.permissions,
              active: userData.active
            }
          };
        } else {
          results[results.length - 1] = {
            test: 'Read Current User Profile',
            status: 'error',
            message: 'User profile not found in Firestore'
          };
        }
      } else {
        results[results.length - 1] = {
          test: 'Read Current User Profile',
          status: 'error',
          message: 'Not authenticated'
        };
      }
    } catch (error: any) {
      results[results.length - 1] = {
        test: 'Read Current User Profile',
        status: 'error',
        message: error.message
      };
    }
    setTests([...results]);

    // Test 4: Check Admin Privileges
    results.push({ test: 'Check Admin Privileges', status: 'pending' });
    setTests([...results]);

    try {
      const user = auth.currentUser;
      if (user) {
        const { getDoc, doc } = await import('firebase/firestore');
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const hasAdmin = userData.roles?.includes('admin') || userData.roles?.includes('super_admin');

          results[results.length - 1] = {
            test: 'Check Admin Privileges',
            status: hasAdmin ? 'success' : 'error',
            message: hasAdmin ? 'User has admin privileges' : 'User does not have admin privileges',
            data: {
              roles: userData.roles,
              isAdmin: hasAdmin
            }
          };
        }
      }
    } catch (error: any) {
      results[results.length - 1] = {
        test: 'Check Admin Privileges',
        status: 'error',
        message: error.message
      };
    }
    setTests([...results]);

    setIsRunning(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Firebase Permissions Test
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Run diagnostics to check Firebase authentication and Firestore permissions.
        </p>
      </div>

      <button
        onClick={runTests}
        disabled={isRunning}
        className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Running Tests...</span>
          </>
        ) : (
          <>
            <Database className="h-5 w-5" />
            <span>Run Tests</span>
          </>
        )}
      </button>

      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                test.status === 'success'
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : test.status === 'error'
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {test.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : test.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-400 animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {test.test}
                  </h3>
                  {test.message && (
                    <p className={`text-sm mt-1 ${
                      test.status === 'success'
                        ? 'text-green-700 dark:text-green-300'
                        : test.status === 'error'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {test.message}
                    </p>
                  )}
                  {test.data && (
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}