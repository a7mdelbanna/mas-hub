import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { User as UserIcon, Mail, Phone, Building, UserCheck, Globe, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { userService } from '../../../services/mock/user.service';
import type { CreateUserRequest } from '../../../services/mock/user.service';
import { type User } from '../../../services/mock/auth.service';
import { useDepartments, useRoles, useManagers } from '../../../hooks/useMockUsers';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null; // null for create, User for edit
  onSuccess?: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { roles = [] } = useRoles();
  const { departments = [] } = useDepartments();
  const { managers = [] } = useManagers();

  const isEditing = !!user;

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    displayName: '',
    phoneNumber: '',
    departmentId: '',
    managerId: '',
    position: '',
    title: '',
    active: true,
    roles: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Password not needed for edit
        name: user.name || '',
        displayName: user.displayName || user.name || '',
        phoneNumber: user.phoneNumber || '',
        departmentId: user.departmentId || '',
        managerId: user.managerId || '',
        position: user.position || '',
        title: user.title || '',
        active: user.active,
        roles: user.roles || [],
      });
    } else {
      // Reset form for new user
      setFormData({
        email: '',
        password: '',
        name: '',
        displayName: '',
        phoneNumber: '',
        departmentId: '',
        managerId: '',
        position: '',
        title: '',
        active: true,
        roles: ['employee'], // Default role
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required for new users';
    } else if (!isEditing && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const userData: CreateUserRequest = {
        email: formData.email,
        name: formData.name,
        displayName: formData.displayName || formData.name,
        roles: formData.roles,
        phoneNumber: formData.phoneNumber || undefined,
        departmentId: formData.departmentId || undefined,
        position: formData.position || undefined,
        title: formData.title || undefined,
        managerId: formData.managerId || undefined,
        active: formData.active,
        password: !isEditing ? formData.password : undefined,
      };

      if (isEditing && user) {
        await userService.updateUser(user.id, userData);
        dispatch(addNotification({
          type: 'success',
          title: 'User Updated',
          message: `${formData.name} has been updated successfully`,
        }));
      } else {
        await userService.createUser(userData);
        dispatch(addNotification({
          type: 'success',
          title: 'User Created',
          message: `${formData.name} has been created successfully`,
        }));
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        message: error?.message || 'An error occurred while processing your request',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId]
    }));
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit User' : 'Add New User'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              `}
              placeholder="user@company.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserIcon className="h-4 w-4 inline mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              `}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Password (only for new users) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <UserIcon className="h-4 w-4 inline mr-2" />
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors
                `}
                placeholder="Minimum 8 characters"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              `}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserCheck className="h-4 w-4 inline mr-2" />
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="
                w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              "
              placeholder="Software Engineer"
            />
          </div>
        </div>

        {/* Department and Manager */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Building className="h-4 w-4 inline mr-2" />
              Department
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleChange('departmentId', e.target.value)}
              className="
                w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              "
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserCheck className="h-4 w-4 inline mr-2" />
              Manager
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => handleChange('managerId', e.target.value)}
              className="
                w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              "
            >
              <option value="">Select Manager</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name || manager.displayName} {manager.email && `(${manager.email})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date and Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="h-4 w-4 inline mr-2" />
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="
                w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              "
              placeholder="e.g., Senior Manager"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserIcon className="h-4 w-4 inline mr-2" />
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="
                w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
              "
              placeholder="Optional display name"
            />
          </div>
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Roles *
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            {roles.map(role => (
              <label key={role.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                <button
                  type="button"
                  onClick={() => handleRoleToggle(role.id)}
                  className="flex items-center"
                >
                  {formData.roles.includes(role.id) ? (
                    <ToggleRight className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
                  {role.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
          {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles}</p>}
        </div>

        {/* Status Toggle */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleChange('active', !formData.active)}
            className="flex items-center"
          >
            {formData.active ? (
              <ToggleRight className="h-6 w-6 text-green-600" />
            ) : (
              <ToggleLeft className="h-6 w-6 text-gray-400" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active User
          </span>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="
              px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
              bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="
              px-6 py-2 text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex items-center space-x-2
            "
          >
            {isLoading && <LoadingSpinner size="sm" text="" />}
            <span>{isEditing ? 'Update User' : 'Create User'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};