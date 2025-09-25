import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase/config';
import { logout } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { useTheme } from '../ui/ThemeProvider';
import {
  Menu,
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Globe,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils/cn';

type PortalType = 'admin' | 'employee' | 'client' | 'candidate';

interface PortalHeaderProps {
  portalType: PortalType;
  user: any;
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const portalTitles = {
  admin: 'Admin Dashboard',
  employee: 'Employee Portal',
  client: 'Client Portal',
  candidate: 'Candidate Portal',
};

export function PortalHeader({
  portalType,
  user,
  onSidebarToggle,
  sidebarOpen
}: PortalHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      dispatch(addNotification({
        type: 'success',
        title: t('auth.signOutSuccess'),
        message: 'You have been signed out successfully.',
      }));
      navigate('/login');
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Logout Error',
        message: error.message,
      }));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-30">
      {/* Left Side */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Portal Title */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
          {portalTitles[portalType]}
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-2">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          title={`Switch to ${i18n.language === 'en' ? 'Arabic' : 'English'}`}
        >
          <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Theme Toggle */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {getThemeIcon()}
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
              <button
                onClick={() => { setTheme('light'); setThemeDropdownOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Sun className="h-4 w-4 mr-3" />
                Light
              </button>
              <button
                onClick={() => { setTheme('dark'); setThemeDropdownOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Moon className="h-4 w-4 mr-3" />
                Dark
              </button>
              <button
                onClick={() => { setTheme('system'); setThemeDropdownOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Monitor className="h-4 w-4 mr-3" />
                System
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary relative">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50">
              <button
                onClick={() => { navigate(`/${portalType}/profile`); setDropdownOpen(false); }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <UserIcon className="h-4 w-4 mr-3" />
                Profile
              </button>

              {portalType === 'admin' && (
                <button
                  onClick={() => { navigate('/admin/settings'); setDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </button>
              )}

              <hr className="my-1 border-gray-200 dark:border-gray-600" />

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <LogOut className="h-4 w-4 mr-3" />
                {t('auth.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(dropdownOpen || themeDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setDropdownOpen(false);
            setThemeDropdownOpen(false);
          }}
        />
      )}
    </header>
  );
}