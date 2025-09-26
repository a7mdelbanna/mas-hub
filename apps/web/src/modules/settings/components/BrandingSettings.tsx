import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Eye, Save, Brush, Sparkles, Palette, Loader2, CheckCircle, Image } from 'lucide-react';
import FileUploadDropzone from '../../../components/ui/FileUploadDropzone';
import useFileUpload, { type FileWithPreview } from '../../../hooks/useFileUpload';
import { useGetBrandingSettingsQuery, useUpdateBrandingSettingsMutation, useCreateBrandingSettingsMutation, useUploadLogoMutation, useDeleteLogoMutation } from '../../../lib/api/brandingApi';
import type { BrandingSettings as BrandingSettingsType } from '../../../lib/api/brandingApi';
import { addNotification } from '../../../store/slices/uiSlice';

export default function BrandingSettings() {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // API hooks
  const { data: brandingData, isLoading, error: fetchError } = useGetBrandingSettingsQuery();
  const [updateBranding] = useUpdateBrandingSettingsMutation();
  const [createBranding] = useCreateBrandingSettingsMutation();
  const [uploadLogo] = useUploadLogoMutation();
  const [deleteLogo] = useDeleteLogoMutation();

  // Local state for form data
  const [brandColors, setBrandColors] = useState({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937'
  });

  const [brandInfo, setBrandInfo] = useState({
    companyName: 'MAS Technologies',
    tagline: 'Innovative Business Solutions',
    description: 'Leading provider of enterprise software solutions'
  });

  const [logoUrls, setLogoUrls] = useState({
    primary: null as string | null,
    secondary: null as string | null,
    favicon: null as string | null
  });

  // File upload hooks for each logo type
  const primaryUpload = useFileUpload({
    acceptedTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'],
    maxSize: 2 * 1024 * 1024,
  });

  const secondaryUpload = useFileUpload({
    acceptedTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'],
    maxSize: 2 * 1024 * 1024,
  });

  const faviconUpload = useFileUpload({
    acceptedTypes: ['image/x-icon', 'image/png'],
    maxSize: 512 * 1024, // 512KB for favicon
  });

  const [currentFiles, setCurrentFiles] = useState({
    primary: null as FileWithPreview | null,
    secondary: null as FileWithPreview | null,
    favicon: null as FileWithPreview | null
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load branding data when component mounts
  useEffect(() => {
    if (brandingData) {
      setBrandColors(brandingData.brandColors);
      setBrandInfo({
        companyName: brandingData.companyName,
        tagline: brandingData.tagline,
        description: brandingData.description,
      });
      setLogoUrls({
        primary: brandingData.primaryLogo || null,
        secondary: brandingData.secondaryLogo || null,
        favicon: brandingData.favicon || null,
      });
    }
  }, [brandingData]);

  // File upload handlers
  const handleFileSelect = async (type: 'primary' | 'secondary' | 'favicon', file: File | null) => {
    const uploadHook = type === 'primary' ? primaryUpload : type === 'secondary' ? secondaryUpload : faviconUpload;

    if (!file) {
      // Remove file
      setCurrentFiles(prev => ({ ...prev, [type]: null }));
      uploadHook.resetUpload();

      // Delete from server if exists
      if (logoUrls[type]) {
        try {
          await deleteLogo({ type }).unwrap();
          setLogoUrls(prev => ({ ...prev, [type]: null }));
          dispatch(addNotification({
            type: 'success',
            title: 'Logo Removed',
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} logo has been removed successfully.`,
          }));
        } catch (error) {
          dispatch(addNotification({
            type: 'error',
            title: 'Removal Failed',
            message: `Failed to remove ${type} logo. Please try again.`,
          }));
        }
      }
      return null;
    }

    // Validate and set preview
    const fileWithPreview = uploadHook.handleFileSelect(file);
    if (fileWithPreview) {
      setCurrentFiles(prev => ({ ...prev, [type]: fileWithPreview }));

      // Start upload
      const clearProgress = uploadHook.startUpload();

      try {
        const result = await uploadLogo({ file, type }).unwrap();

        // Complete upload
        clearProgress();
        uploadHook.completeUpload(result);

        // Update logo URL
        setLogoUrls(prev => ({ ...prev, [type]: result.url }));

        dispatch(addNotification({
          type: 'success',
          title: 'Upload Successful',
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} logo has been uploaded successfully.`,
        }));
      } catch (error: any) {
        clearProgress();
        uploadHook.failUpload(error?.data?.message || `Failed to upload ${type} logo`);
        setCurrentFiles(prev => ({ ...prev, [type]: null }));
      }
    }

    return fileWithPreview;
  };

  // Save branding settings
  const handleSaveBranding = async () => {
    setIsSaving(true);

    try {
      const brandingPayload = {
        companyName: brandInfo.companyName,
        tagline: brandInfo.tagline,
        description: brandInfo.description,
        brandColors,
      };

      if (brandingData?.id) {
        // Update existing
        await updateBranding({
          id: brandingData.id,
          ...brandingPayload
        }).unwrap();
      } else {
        // Create new
        await createBranding(brandingPayload).unwrap();
      }

      dispatch(addNotification({
        type: 'success',
        title: 'Branding Saved',
        message: 'Your branding settings have been saved successfully.',
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Save Failed',
        message: error?.data?.message || 'Failed to save branding settings. Please try again.',
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleResetToDefault = () => {
    setBrandColors({
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937'
    });
    setBrandInfo({
      companyName: 'MAS Technologies',
      tagline: 'Innovative Business Solutions',
      description: 'Leading provider of enterprise software solutions'
    });

    dispatch(addNotification({
      type: 'info',
      title: 'Settings Reset',
      message: 'Branding settings have been reset to defaults.',
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading branding settings...</p>
        </div>
      </div>
    );
  }

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
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30 animate-pulse-slow">
                    <Brush className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-purple-900 dark:from-white dark:via-pink-100 dark:to-purple-100 bg-clip-text text-transparent">
                      Branding Settings
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      Customize your brand identity and visual presence across all portals
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-3xl -mr-48 -mt-48 group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Logo Management */}
        <div className={`transition-all duration-1000 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
                  <Image className="h-6 w-6 text-blue-500" />
                  <span>Logo Management</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Primary Logo */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Primary Logo</span>
                    </label>
                    <FileUploadDropzone
                      onFileSelect={(file) => handleFileSelect('primary', file)}
                      currentFile={currentFiles.primary}
                      currentPreviewUrl={logoUrls.primary}
                      isUploading={primaryUpload.uploadState.isUploading}
                      progress={primaryUpload.uploadState.progress}
                      error={primaryUpload.uploadState.error}
                      accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                      maxSize={2}
                      title="Primary Logo"
                      description="SVG, PNG, JPG"
                      type="primary"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                      Used in headers and main navigation
                    </p>
                  </div>

                  {/* Secondary Logo */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Secondary Logo</span>
                    </label>
                    <FileUploadDropzone
                      onFileSelect={(file) => handleFileSelect('secondary', file)}
                      currentFile={currentFiles.secondary}
                      currentPreviewUrl={logoUrls.secondary}
                      isUploading={secondaryUpload.uploadState.isUploading}
                      progress={secondaryUpload.uploadState.progress}
                      error={secondaryUpload.uploadState.error}
                      accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                      maxSize={2}
                      title="Secondary Logo"
                      description="SVG, PNG, JPG"
                      type="secondary"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                      Used in emails and documents
                    </p>
                  </div>

                  {/* Favicon */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span>Favicon</span>
                    </label>
                    <FileUploadDropzone
                      onFileSelect={(file) => handleFileSelect('favicon', file)}
                      currentFile={currentFiles.favicon}
                      currentPreviewUrl={logoUrls.favicon}
                      isUploading={faviconUpload.uploadState.isUploading}
                      progress={faviconUpload.uploadState.progress}
                      error={faviconUpload.uploadState.error}
                      accept="image/x-icon,image/png"
                      maxSize={0.5}
                      title="Favicon"
                      description="ICO, PNG (32x32)"
                      type="favicon"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                      Browser tab icon
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-white dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
                  <Palette className="h-6 w-6 text-purple-500" />
                  <span>Brand Colors</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Primary Brand Color</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={brandColors.primary}
                          onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                          className="h-14 w-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={brandColors.primary}
                          onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Secondary Brand Color</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={brandColors.secondary}
                          onChange={(e) => setBrandColors({ ...brandColors, secondary: e.target.value })}
                          className="h-14 w-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={brandColors.secondary}
                          onChange={(e) => setBrandColors({ ...brandColors, secondary: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span>Background Color</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={brandColors.background}
                          onChange={(e) => setBrandColors({ ...brandColors, background: e.target.value })}
                          className="h-14 w-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={brandColors.background}
                          onChange={(e) => setBrandColors({ ...brandColors, background: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-500/10 to-slate-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <span>Text Color</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={brandColors.text}
                          onChange={(e) => setBrandColors({ ...brandColors, text: e.target.value })}
                          className="h-14 w-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={brandColors.text}
                          onChange={(e) => setBrandColors({ ...brandColors, text: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-500/10 to-gray-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Brand Information */}
        <div className={`transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-purple-900 dark:from-white dark:via-pink-100 dark:to-purple-100 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
                  <Sparkles className="h-6 w-6 text-pink-500" />
                  <span>Brand Information</span>
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Company Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={brandInfo.companyName}
                        onChange={(e) => setBrandInfo({ ...brandInfo, companyName: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                        placeholder="Your company name"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Tagline</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={brandInfo.tagline}
                        onChange={(e) => setBrandInfo({ ...brandInfo, tagline: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                        placeholder="Your company tagline"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span>Description</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={brandInfo.description}
                        onChange={(e) => setBrandInfo({ ...brandInfo, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300 min-h-[120px] resize-none"
                        placeholder="Brief company description"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-red-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={`transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
                  <Eye className="h-6 w-6 text-blue-500" />
                  <span>Brand Preview</span>
                </h3>
                <div
                  className="p-12 rounded-2xl border border-white/10 dark:border-gray-700/30 shadow-inner"
                  style={{ backgroundColor: brandColors.background }}
                >
                  <div className="text-center space-y-6">
                    <div
                      className="w-28 h-28 mx-auto rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 overflow-hidden"
                      style={{ backgroundColor: brandColors.primary }}
                    >
                      {logoUrls.primary ? (
                        <img
                          src={logoUrls.primary}
                          alt="Primary Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {brandInfo.companyName.split(' ').map(word => word[0]).join('')}
                        </span>
                      )}
                    </div>
                    <h2
                      className="text-4xl font-bold"
                      style={{ color: brandColors.text }}
                    >
                      {brandInfo.companyName}
                    </h2>
                    <p
                      className="text-xl font-semibold"
                      style={{ color: brandColors.secondary }}
                    >
                      {brandInfo.tagline}
                    </p>
                    <p
                      className="text-base max-w-md mx-auto leading-relaxed"
                      style={{ color: brandColors.text, opacity: 0.8 }}
                    >
                      {brandInfo.description}
                    </p>
                    <div className="flex justify-center space-x-4 pt-6">
                      <button
                        className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: brandColors.primary }}
                      >
                        Primary Action
                      </button>
                      <button
                        className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: brandColors.secondary }}
                      >
                        Secondary Action
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Save Button Section */}
        <div className={`transition-all duration-1000 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex justify-end space-x-4 pt-8 border-t border-white/10 dark:border-gray-700/30">
            <button
              onClick={handleResetToDefault}
              disabled={isSaving}
              className="relative group px-8 py-4 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white/30 dark:hover:bg-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Reset to Default</span>
            </button>
            <button
              onClick={handleSaveBranding}
              disabled={isSaving}
              className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white font-semibold shadow-2xl shadow-pink-500/25 hover:shadow-3xl hover:shadow-pink-500/40 transition-all duration-500 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-100 group-hover:opacity-90 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center space-x-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Branding</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}