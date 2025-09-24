import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';

interface LessonBuilderProps {
  lesson?: Lesson;
  courseId: string;
  onSave: (lessonData: Partial<Lesson>) => void;
  onCancel: () => void;
}

interface LessonFormData {
  title: string;
  description: string;
  type: 'video' | 'document' | 'article' | 'interactive';
  content: string;
  url: string;
  duration: number;
  order: number;
  required: boolean;
}

export const LessonBuilder: React.FC<LessonBuilderProps> = ({
  lesson,
  courseId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    type: 'article',
    content: '',
    url: '',
    duration: 10,
    order: 1,
    required: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        type: lesson.type,
        content: lesson.content || '',
        url: lesson.url || '',
        duration: lesson.duration || 10,
        order: lesson.order,
        required: lesson.required
      });
    }
  }, [lesson]);

  const handleChange = (field: keyof LessonFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Lesson type is required';
    }

    // Type-specific validation
    switch (formData.type) {
      case 'video':
      case 'document':
      case 'interactive':
        if (!formData.url.trim()) {
          newErrors.url = 'URL is required for this lesson type';
        } else if (!isValidUrl(formData.url)) {
          newErrors.url = 'Please enter a valid URL';
        }
        break;
      case 'article':
        if (!formData.content.trim()) {
          newErrors.content = 'Content is required for article lessons';
        }
        break;
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.order <= 0) {
      newErrors.order = 'Order must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const lessonData: Partial<Lesson> = {
      courseId,
      ...formData
    };

    onSave(lessonData);
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/video.mp4"
              />
              {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: MP4, WebM, Ogg. You can also use YouTube or Vimeo URLs.
              </p>
            </div>

            <VideoPreview url={formData.url} />
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/document.pdf"
              />
              {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
              <p className="mt-1 text-sm text-gray-500">
                PDF documents work best. Make sure the URL is publicly accessible.
              </p>
            </div>

            <DocumentPreview url={formData.url} />
          </div>
        );

      case 'article':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Article Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={15}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Write your article content here. You can use HTML for formatting..."
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
            <p className="mt-1 text-sm text-gray-500">
              You can use basic HTML tags for formatting (h1, h2, p, strong, em, ul, ol, li, a, img).
            </p>
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Interactive Content URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com/interactive-lesson"
              />
              {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Link to interactive content like simulations, games, or embedded tools.
              </p>
            </div>

            <InteractivePreview url={formData.url} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6">
          {lesson ? 'Edit Lesson' : 'Create New Lesson'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Lesson Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter lesson title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lesson Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="document">Document/PDF</option>
                <option value="interactive">Interactive</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.order ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description of the lesson"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => handleChange('required', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm font-medium">Required lesson</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Students must complete required lessons to finish the course
              </p>
            </div>
          </div>

          {/* Type-specific fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Content</h3>
            {renderTypeSpecificFields()}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 border-t pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {lesson ? 'Update Lesson' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preview Components
const VideoPreview: React.FC<{ url: string }> = ({ url }) => {
  if (!url) return null;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2">Preview</label>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <video src={url} controls className="w-full max-w-md aspect-video" />
      </div>
    </div>
  );
};

const DocumentPreview: React.FC<{ url: string }> = ({ url }) => {
  if (!url) return null;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2">Preview</label>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          Open document in new tab
        </a>
      </div>
    </div>
  );
};

const InteractivePreview: React.FC<{ url: string }> = ({ url }) => {
  if (!url) return null;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium mb-2">Preview</label>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
          Open interactive content in new tab
        </a>
      </div>
    </div>
  );
};