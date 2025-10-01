import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { PasswordStrength } from '../../../components/shared/PasswordStrength';
import { StepProgress } from '../../../components/shared/StepProgress';
import { useEmailValidation } from '../../../hooks/useEmailValidation';
import { Mail, Lock, User, Building, Briefcase, Eye, EyeOff, ArrowRight, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { authService } from '../../../services/mock';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: string;
  companyName?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
}

const steps = [
  { title: 'Account', description: 'Basic info' },
  { title: 'Profile', description: 'Personal details' },
  { title: 'Role', description: 'Select your role' },
  { title: 'Complete', description: 'Finish setup' },
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: '',
    companyName: '',
    department: '',
    position: '',
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Real-time email validation
  const emailValidation = useEmailValidation(formData.email, 500);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    if (step === 0) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      } else if (emailValidation.error) {
        newErrors.email = emailValidation.error;
      } else if (emailValidation.isValid === false) {
        newErrors.email = 'This email is already registered';
      }

      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 1) {
      if (!formData.displayName) newErrors.displayName = 'Full name is required';
    }

    if (step === 2) {
      if (!formData.role) newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    // For step 0 (email step), also check if email is still being validated
    if (currentStep === 0 && (emailValidation.isChecking || emailValidation.isValid === null || emailValidation.isValid === false)) {
      return;
    }

    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      // Use the new auth service for signing up
      const userProfile = await authService.signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        role: formData.role as any,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        department: formData.department,
        position: formData.position,
      });

      dispatch(addNotification({
        type: 'success',
        title: 'Account created successfully!',
        message: `Welcome to MAS Business OS, ${userProfile.displayName}! Please check your email to verify your account.`,
      }));

      navigate('/onboarding');

    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = error.message || 'Failed to create account';
      if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }

      dispatch(addNotification({
        type: 'error',
        title: 'Signup Failed',
        message: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`input pr-20 ${
                    errors.email || emailValidation.error
                      ? 'border-red-500'
                      : emailValidation.isValid === true
                      ? 'border-green-500'
                      : ''
                  }`}
                  placeholder="you@company.com"
                />
                <div className="absolute right-3 top-3 flex items-center space-x-2">
                  {emailValidation.isChecking ? (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  ) : emailValidation.isValid === true ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : emailValidation.isValid === false ? (
                    <X className="h-4 w-4 text-red-500" />
                  ) : null}
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {(errors.email || emailValidation.error) && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email || emailValidation.error}
                </p>
              )}
              {emailValidation.isValid === true && !emailValidation.error && (
                <p className="mt-1 text-sm text-green-600">
                  {emailValidation.message || 'Email is available'}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              <PasswordStrength password={formData.password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className={`input pr-10 ${errors.displayName ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
                <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name (Optional)
              </label>
              <div className="relative">
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="input pr-10"
                  placeholder="Your Company"
                />
                <Building className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'admin', label: 'Administrator', description: 'Full system access and management' },
                  { value: 'manager', label: 'Manager', description: 'Manage teams and projects' },
                  { value: 'employee', label: 'Employee', description: 'Access to employee portal and tasks' },
                  { value: 'client', label: 'Client', description: 'View projects and invoices' },
                  { value: 'candidate', label: 'Candidate', description: 'Apply for positions and track applications' },
                ].map((roleOption) => (
                  <button
                    key={roleOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: roleOption.value })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.role === roleOption.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">{roleOption.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{roleOption.description}</p>
                  </button>
                ))}
              </div>
              {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
            </div>

            {(formData.role === 'employee' || formData.role === 'manager') && (
              <>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department (Optional)
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input"
                    placeholder="Engineering"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Position (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="position"
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="input pr-10"
                      placeholder="Software Engineer"
                    />
                    <Briefcase className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">You're all set!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click the button below to create your account and get started with MAS Business OS.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left mt-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Summary</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Email:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{formData.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Name:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{formData.displayName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Role:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium capitalize">{formData.role}</dd>
                </div>
                {formData.companyName && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Company:</dt>
                    <dd className="text-gray-900 dark:text-white font-medium">{formData.companyName}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 py-10">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Join MAS Business OS and streamline your workflow
            </p>
          </div>

          <div className="mb-8">
            <StepProgress steps={steps} currentStep={currentStep} />
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="mt-8 flex gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary flex items-center justify-center px-6 py-3"
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 0 && (emailValidation.isChecking || emailValidation.isValid !== true)}
                  className={`btn btn-primary flex-1 flex items-center justify-center px-6 py-3 ${
                    currentStep === 0 && (emailValidation.isChecking || emailValidation.isValid !== true)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {currentStep === 0 && emailValidation.isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary flex-1 flex items-center justify-center px-6 py-3"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}