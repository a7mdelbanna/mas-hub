import { useState, useEffect, useCallback } from 'react';
import { useLazyCheckEmailAvailabilityQuery } from '../lib/api/mockAuthApi';

export interface EmailValidationState {
  isValid: boolean | null;
  isChecking: boolean;
  message: string;
  error: string | null;
}

export function useEmailValidation(email: string, debounceMs: number = 500) {
  const [validationState, setValidationState] = useState<EmailValidationState>({
    isValid: null,
    isChecking: false,
    message: '',
    error: null,
  });

  const [checkEmailAvailability, { isLoading }] = useLazyCheckEmailAvailabilityQuery();

  // Debounce function
  const debounce = useCallback((func: () => void, delay: number) => {
    const timeoutId = setTimeout(func, delay);
    return () => clearTimeout(timeoutId);
  }, []);

  const validateEmail = useCallback(async (emailToValidate: string) => {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailToValidate) {
      setValidationState({
        isValid: null,
        isChecking: false,
        message: '',
        error: null,
      });
      return;
    }

    if (!emailRegex.test(emailToValidate)) {
      setValidationState({
        isValid: false,
        isChecking: false,
        message: 'Invalid email format',
        error: 'Invalid email format',
      });
      return;
    }

    setValidationState(prev => ({
      ...prev,
      isChecking: true,
      error: null,
    }));

    try {
      const result = await checkEmailAvailability({ email: emailToValidate }).unwrap();

      setValidationState({
        isValid: result.available,
        isChecking: false,
        message: result.message,
        error: result.available ? null : result.message,
      });
    } catch (error: any) {
      setValidationState({
        isValid: false,
        isChecking: false,
        message: error.message || 'Failed to check email availability',
        error: error.message || 'Failed to check email availability',
      });
    }
  }, [checkEmailAvailability]);

  useEffect(() => {
    if (!email) {
      setValidationState({
        isValid: null,
        isChecking: false,
        message: '',
        error: null,
      });
      return;
    }

    const cleanup = debounce(() => {
      validateEmail(email);
    }, debounceMs);

    return cleanup;
  }, [email, debounceMs, validateEmail, debounce]);

  return {
    ...validationState,
    isChecking: validationState.isChecking,
  };
}