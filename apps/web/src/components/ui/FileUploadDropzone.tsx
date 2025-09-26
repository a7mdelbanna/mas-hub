import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import type { FileWithPreview } from '../../hooks/useFileUpload';

export interface FileUploadDropzoneProps {
  onFileSelect: (file: File | null) => FileWithPreview | null;
  currentFile?: FileWithPreview | null;
  currentPreviewUrl?: string | null;
  isUploading?: boolean;
  progress?: number;
  error?: string | null;
  accept?: string;
  maxSize?: number;
  title: string;
  description: string;
  className?: string;
  previewClassName?: string;
  type: 'primary' | 'secondary' | 'favicon';
}

export default function FileUploadDropzone({
  onFileSelect,
  currentFile,
  currentPreviewUrl,
  isUploading = false,
  progress = 0,
  error,
  accept,
  maxSize = 2,
  title,
  description,
  className,
  previewClassName,
  type,
}: FileUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const getColorClasses = useCallback(() => {
    switch (type) {
      case 'primary':
        return {
          icon: 'from-blue-500 to-purple-600',
          border: 'hover:border-blue-400/50',
          bg: 'bg-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600',
          iconColor: 'text-blue-500 dark:text-blue-400',
        };
      case 'secondary':
        return {
          icon: 'from-purple-500 to-pink-600',
          border: 'hover:border-purple-400/50',
          bg: 'bg-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-600',
          iconColor: 'text-purple-500 dark:text-purple-400',
        };
      case 'favicon':
        return {
          icon: 'from-pink-500 to-purple-600',
          border: 'hover:border-pink-400/50',
          bg: 'bg-pink-100 to-purple-100 dark:from-gray-700 dark:to-gray-600',
          iconColor: 'text-pink-500 dark:text-pink-400',
        };
      default:
        return {
          icon: 'from-blue-500 to-purple-600',
          border: 'hover:border-blue-400/50',
          bg: 'bg-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600',
          iconColor: 'text-blue-500 dark:text-blue-400',
        };
    }
  }, [type]);

  const colors = getColorClasses();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [onFileSelect]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileSelect(null);
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isUploading]);

  const hasFile = currentFile || currentPreviewUrl;
  const previewUrl = currentFile?.previewUrl || currentPreviewUrl;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative group">
        <div
          className={cn(
            'border-2 border-dashed border-white/30 dark:border-gray-600/30 rounded-2xl p-8 text-center transition-all duration-300 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm cursor-pointer',
            colors.border,
            isDragOver && 'border-solid bg-white/30 dark:bg-gray-700/30 scale-105',
            isUploading && 'pointer-events-none',
            hasFile ? 'hover:bg-white/30 dark:hover:bg-gray-700/30' : 'hover:bg-white/30 dark:hover:bg-gray-700/30'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={isUploading}
          />

          {hasFile ? (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className={cn(
                'w-full h-40 rounded-xl flex items-center justify-center shadow-inner overflow-hidden',
                `bg-gradient-to-br ${colors.bg}`,
                previewClassName
              )}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}
                <ImageIcon
                  className={cn(
                    'h-16 w-16',
                    colors.iconColor,
                    previewUrl ? 'hidden' : 'block'
                  )}
                />
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  {currentFile?.name || 'Uploaded file'}
                </p>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading... {Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300 rounded-full bg-gradient-to-r',
                          colors.icon
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                {!isUploading && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center justify-center space-x-2 w-full p-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove {type === 'favicon' ? 'Icon' : 'Logo'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload Icon */}
              <div className={cn(
                'p-4 rounded-2xl w-fit mx-auto shadow-lg hover:shadow-xl transition-all duration-300',
                isDragOver ? 'scale-110' : 'hover:scale-110',
                `bg-gradient-to-br ${colors.icon}`
              )}>
                <Upload className="h-10 w-10 text-white" />
              </div>

              {/* Upload Text */}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {isDragOver ? `Drop ${title.toLowerCase()} here` : `Click to upload ${title.toLowerCase()}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {description} (max. {maxSize}MB)
                </p>
              </div>
            </div>
          )}

          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Upload className="h-12 w-12 text-blue-500 mx-auto mb-2 animate-bounce" />
                <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                  Drop to upload
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className={cn(
          'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
          `bg-gradient-to-br ${colors.icon.replace('from-', 'from-').replace('to-', 'to-')}/10`
        )} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Display */}
      {hasFile && !isUploading && !error && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{title} uploaded successfully</span>
        </div>
      )}
    </div>
  );
}