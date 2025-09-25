import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../lib/firebase/config';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Get the ID token to check roles
      const idTokenResult = await userCredential.user.getIdTokenResult();
      const roles = idTokenResult.claims.roles as string[] || [];

      dispatch(addNotification({
        type: 'success',
        title: t('auth.signInSuccess'),
        message: `Welcome back!`,
      }));

      // Redirect based on user role
      if (roles.includes('admin') || roles.includes('super_admin')) {
        navigate('/admin', { replace: true });
      } else if (roles.includes('manager') || roles.includes('employee')) {
        navigate('/employee', { replace: true });
      } else if (roles.includes('client')) {
        navigate('/client', { replace: true });
      } else if (roles.includes('candidate')) {
        navigate('/candidate', { replace: true });
      } else {
        // Fallback to employee dashboard
        navigate('/employee', { replace: true });
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: error.message || t('auth.invalidCredentials'),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      dispatch(addNotification({
        type: 'warning',
        title: 'Email Required',
        message: 'Please enter your email address first.',
      }));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      dispatch(addNotification({
        type: 'success',
        title: t('auth.passwordResetSent'),
        message: 'Check your email for password reset instructions.',
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: error.message,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 py-10">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('app.name')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('auth.welcomeBack')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.email')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="Enter your email"
                />
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('auth.password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80"
                disabled={resetEmailSent}
              >
                {resetEmailSent ? 'Reset email sent' : t('auth.forgotPassword')}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center px-4 py-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {t('auth.signIn')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Don't have an account?{' '}
              <a href="/signup" className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </a>
            </p>
            <p className="mt-4">MAS Business OS v1.0</p>
            <p className="mt-1">© 2024 MAS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}