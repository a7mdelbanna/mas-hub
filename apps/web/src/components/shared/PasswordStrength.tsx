import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (): { score: number; label: string; color: string } => {
    if (password.length === 0) {
      return { score: 0, label: '', color: 'bg-gray-200' };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { score, label: 'Weak', color: 'bg-red-500' };
    } else if (score <= 3) {
      return { score, label: 'Fair', color: 'bg-yellow-500' };
    } else if (score <= 4) {
      return { score, label: 'Good', color: 'bg-blue-500' };
    } else {
      return { score, label: 'Strong', color: 'bg-green-500' };
    }
  };

  const strength = getStrength();

  if (password.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${
        strength.score <= 2 ? 'text-red-600' :
        strength.score <= 3 ? 'text-yellow-600' :
        strength.score <= 4 ? 'text-blue-600' : 'text-green-600'
      }`}>
        Password strength: {strength.label}
      </p>
      <ul className="mt-1 text-xs text-gray-500 dark:text-gray-400 list-disc list-inside">
        {password.length < 8 && <li>At least 8 characters</li>}
        {!/[a-z]/.test(password) && <li>Include lowercase letter</li>}
        {!/[A-Z]/.test(password) && <li>Include uppercase letter</li>}
        {!/\d/.test(password) && <li>Include number</li>}
        {!/[^a-zA-Z0-9]/.test(password) && <li>Include special character</li>}
      </ul>
    </div>
  );
}