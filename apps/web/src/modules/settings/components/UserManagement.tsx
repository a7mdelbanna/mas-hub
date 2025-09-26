import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Crown, Shield, UserCheck, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { useUsers } from '../../../hooks/useUsers';
import { userService } from '../../../lib/firebase/services/user.service';
import { type User } from '../../../lib/firebase/services/auth.service';
import { UserForm } from './UserForm';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export default function UserManagement() {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Use Firebase hooks
  const { users, loading: isLoading, error, refetch, filters, setFilters } = useUsers({
    search: '',
    active: undefined as boolean | undefined,
    limit: 50,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAddUser = () => {
    setEditingUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      dispatch(addNotification({
        type: 'success',
        title: 'User Deleted',
        message: `${userToDelete.displayName || userToDelete.name} has been deleted successfully`,
      }));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      refetch();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error?.message || 'Failed to delete user',
      }));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    refetch();
  };

  const getRoleIcon = (roles: string[]) => {
    if (!roles || roles.length === 0) return <UserCheck className="h-4 w-4 text-gray-500" />;

    // Show icon based on highest priority role
    if (roles.includes('admin') || roles.includes('super_admin')) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    } else if (roles.includes('hr')) {
      return <Shield className="h-4 w-4 text-purple-500" />;
    } else if (roles.includes('manager')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    } else {
      return <UserCheck className="h-4 w-4 text-green-500" />;
    }
  };

  const getRoleNames = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    const roleLabels: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'hr': 'HR',
      'manager': 'Manager',
      'employee': 'Employee',
      'client': 'Client',
      'candidate': 'Candidate'
    };
    return roles.map(r => roleLabels[r] || r).join(', ');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Mesh Gradients */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/40">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Ultra-Premium Header */}
        <div className={`relative group transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          {/* Glassmorphic Container */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-[1px] shadow-2xl">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-50"></div>

              {/* Content */}
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30 animate-pulse-slow">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                      User Management
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      Manage users, roles, and permissions across your organization
                    </p>
                  </div>
                </div>

                {/* Add User Button */}
                <button
                  onClick={handleAddUser}
                  className="relative group px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-semibold shadow-2xl shadow-emerald-500/25 hover:shadow-3xl hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 opacity-100 group-hover:opacity-90 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add User</span>
                  </div>
                </button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl -mr-48 -mt-48 group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Main Users Table */}
        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Glassmorphic Container */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl">
              {/* Search Bar Section */}
              <div className="p-8 border-b border-white/10 dark:border-gray-700/30">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="p-12">
                  <LoadingSpinner text="Loading users..." />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-12 text-center">
                  <div className="text-red-600 dark:text-red-400 mb-4">
                    <p className="text-lg font-semibold">Failed to load users</p>
                    <p className="text-sm">Please try again later</p>
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && users.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {searchTerm ? 'No users found' : 'No users yet'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first user'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddUser}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add First User</span>
                    </button>
                  )}
                </div>
              )}

              {/* Users Table */}
              {!isLoading && !error && users.length > 0 && (
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 dark:border-gray-700/30">
                      <th className="text-left p-6 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>User</span>
                        </div>
                      </th>
                      <th className="text-left p-6 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Email</th>
                      <th className="text-left p-6 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-purple-500" />
                          <span>Role</span>
                        </div>
                      </th>
                      <th className="text-left p-6 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left p-6 font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-white/5 dark:border-gray-700/20 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-300 group ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                              {((user.displayName || user.name || 'U')).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {user.displayName || user.name}
                              </p>
                              {(user.position || user.title) && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {user.position || user.title}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-gray-600 dark:text-gray-400 font-medium">{user.email}</td>
                        <td className="p-6">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.roles)}
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                              {getRoleNames(user.roles)}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
                            user.active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-emerald-500/20'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 shadow-gray-500/20'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              user.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                            }`}></div>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                              title="Delete user"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-blue-600/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>

        {/* User Count */}
        {!isLoading && !error && users.length > 0 && (
          <div className={`transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px] shadow-2xl">
              <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-6">
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Showing {users.length} {users.length === 1 ? 'user' : 'users'}
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={userFormOpen}
        onClose={() => {
          setUserFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        type="danger"
        confirmText="Delete User"
        isLoading={isDeleting}
      />
    </div>
  );
}