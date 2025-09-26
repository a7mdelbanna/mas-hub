import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const iconColor = type === 'danger' ? 'text-red-600' : 'text-yellow-600';
  const confirmButtonColor = type === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="
            relative w-full max-w-md
            bg-white dark:bg-gray-800
            rounded-xl shadow-2xl
            border border-gray-200 dark:border-gray-700
            transform transition-all duration-200
            backdrop-blur-md bg-opacity-95 dark:bg-opacity-95
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${iconColor}`}>
                {type === 'danger' ? (
                  <Trash2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex space-x-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="
                  px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`
                  px-4 py-2 text-sm font-medium text-white
                  ${confirmButtonColor}
                  border border-transparent rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center space-x-2
                `}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                )}
                <span>{confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};