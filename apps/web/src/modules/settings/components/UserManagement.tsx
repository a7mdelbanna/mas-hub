import React from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const users = [
    { id: 1, name: 'John Smith', email: 'john@mas.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Doe', email: 'jane@mas.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Mike Wilson', email: 'mike@mas.com', role: 'Employee', status: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage users, roles, and permissions.
          </p>
        </div>
        <button className="btn btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="input pl-10 w-full max-w-sm"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Name</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Email</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Role</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-600">
                  <td className="p-4 text-gray-900 dark:text-white">{user.name}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{user.role}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}