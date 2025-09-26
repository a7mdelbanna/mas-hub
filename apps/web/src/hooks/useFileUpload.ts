import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';

export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  previewUrl: string | null;
}

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export interface FileWithPreview extends File {
  previewUrl?: string;
}

const DEFAULT_OPTIONS: FileUploadOptions = {
  maxSize: 2 * 1024 * 1024, // 2MB
  acceptedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon'],
};

export function useFileUpload(options: FileUploadOptions = {}) {
  const dispatch = useDispatch();
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    previewUrl: null,
  });

  const validateFile = useCallback((file: File): string | null => {
    if (!file) return 'No file selected';

    if (mergedOptions.maxSize && file.size > mergedOptions.maxSize) {
      const maxSizeMB = mergedOptions.maxSize / (1024 * 1024);
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    if (mergedOptions.acceptedTypes && !mergedOptions.acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${mergedOptions.acceptedTypes.join(', ')}`;
    }

    return null;
  }, [mergedOptions]);

  const createPreviewUrl = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const clearPreview = useCallback(() => {
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }
    setUploadState(prev => ({
      ...prev,
      previewUrl: null,
      error: null,
    }));
  }, [uploadState.previewUrl]);

  const handleFileSelect = useCallback((file: File | null) => {
    clearPreview();

    if (!file) return null;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadState(prev => ({
        ...prev,
        error: validationError,
      }));

      dispatch(addNotification({
        type: 'error',
        title: 'File Validation Error',
        message: validationError,
      }));

      return null;
    }

    const previewUrl = createPreviewUrl(file);
    setUploadState(prev => ({
      ...prev,
      previewUrl,
      error: null,
    }));

    return Object.assign(file, { previewUrl }) as FileWithPreview;
  }, [validateFile, createPreviewUrl, clearPreview, dispatch]);

  const simulateProgress = useCallback(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        clearInterval(interval);
        progress = 90;
      }
      setUploadState(prev => ({ ...prev, progress }));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const startUpload = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    return simulateProgress();
  }, [simulateProgress]);

  const completeUpload = useCallback((result?: any) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      progress: 100,
    }));

    setTimeout(() => {
      setUploadState(prev => ({
        ...prev,
        progress: 0,
      }));
    }, 1000);

    if (mergedOptions.onSuccess) {
      mergedOptions.onSuccess(result);
    }
  }, [mergedOptions]);

  const failUpload = useCallback((error: string) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      progress: 0,
      error,
    }));

    dispatch(addNotification({
      type: 'error',
      title: 'Upload Failed',
      message: error,
    }));

    if (mergedOptions.onError) {
      mergedOptions.onError(error);
    }
  }, [dispatch, mergedOptions]);

  const resetUpload = useCallback(() => {
    clearPreview();
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      previewUrl: null,
    });
  }, [clearPreview]);

  return {
    uploadState,
    handleFileSelect,
    startUpload,
    completeUpload,
    failUpload,
    resetUpload,
    validateFile,
    createPreviewUrl,
    clearPreview,
  };
}

export default useFileUpload;