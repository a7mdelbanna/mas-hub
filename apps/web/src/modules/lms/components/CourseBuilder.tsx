import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Course, CourseAudience, Lesson, Quiz } from '../types';
import { useCourses } from '../hooks/useCourses';

interface CourseBuilderProps {
  mode: 'create' | 'edit';
}

interface CourseData {
  title: string;
  description: string;
  audience: CourseAudience;
  duration?: number;
  thumbnail?: string;
  productId?: string;
  passingScore: number;
  tags: string[];
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createCourse, updateCourse, getCourseById, loading } = useCourses();

  const [currentStep, setCurrentStep] = useState<'basic' | 'lessons' | 'quizzes' | 'review'>('basic');
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    audience: CourseAudience.EMPLOYEE,
    duration: 0,
    thumbnail: '',
    productId: '',
    passingScore: 70,
    tags: []
  });
  const [lessons, setLessons] = useState<Partial<Lesson>[]>([]);
  const [quizzes, setQuizzes] = useState<Partial<Quiz>[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadCourse(id);
    }
  }, [mode, id]);

  const loadCourse = async (courseId: string) => {
    try {
      const course = await getCourseById(courseId, true);
      if (course) {
        setCourseData({
          title: course.course.title,
          description: course.course.description || '',
          audience: course.course.audience,
          duration: course.course.duration,
          thumbnail: course.course.thumbnail,
          productId: course.course.productId,
          passingScore: course.course.passingScore || 70,
          tags: course.course.tags || []
        });
        setLessons(course.lessons);
        setQuizzes(course.quizzes);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const handleCourseDataChange = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleTagsChange = (tags: string[]) => {
    setCourseData(prev => ({ ...prev, tags }));
    setIsDirty(true);
  };

  const handleSaveCourse = async () => {
    try {
      if (mode === 'create') {
        const course = await createCourse(courseData);
        navigate(`/lms/courses/${course.id}/edit`);
      } else if (mode === 'edit' && id) {
        await updateCourse(id, courseData);
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handlePublish = async () => {
    if (!validateCourse()) {
      return;
    }

    try {
      if (mode === 'edit' && id) {
        await updateCourse(id, { ...courseData, active: true });
        navigate('/lms/courses');
      }
    } catch (error) {
      console.error('Error publishing course:', error);
    }
  };

  const validateCourse = () => {
    if (!courseData.title.trim()) {
      alert('Course title is required');
      return false;
    }

    if (!courseData.description.trim()) {
      alert('Course description is required');
      return false;
    }

    if (lessons.length === 0) {
      alert('At least one lesson is required');
      return false;
    }

    return true;
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Basic Information</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Course Title *</label>
          <input
            type="text"
            value={courseData.title}
            onChange={(e) => handleCourseDataChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter course title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Audience *</label>
          <select
            value={courseData.audience}
            onChange={(e) => handleCourseDataChange('audience', e.target.value as CourseAudience)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={CourseAudience.EMPLOYEE}>Employee</option>
            <option value={CourseAudience.CANDIDATE}>Candidate</option>
            <option value={CourseAudience.CLIENT}>Client</option>
            <option value={CourseAudience.MIXED}>Mixed</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            value={courseData.description}
            onChange={(e) => handleCourseDataChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter course description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Duration (hours)</label>
          <input
            type="number"
            value={courseData.duration || ''}
            onChange={(e) => handleCourseDataChange('duration', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
          <input
            type="number"
            value={courseData.passingScore}
            onChange={(e) => handleCourseDataChange('passingScore', parseInt(e.target.value) || 70)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product ID</label>
          <input
            type="text"
            value={courseData.productId || ''}
            onChange={(e) => handleCourseDataChange('productId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Link to specific product (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
          <input
            type="url"
            value={courseData.thumbnail || ''}
            onChange={(e) => handleCourseDataChange('thumbnail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium mb-2">Tags</label>
          <TagInput
            tags={courseData.tags}
            onChange={handleTagsChange}
            placeholder="Add tags (press Enter)"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => navigate('/lms/courses')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveCourse}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );

  const renderStepNavigation = () => (
    <div className="border-b border-gray-200 mb-8">
      <nav className="flex space-x-8">
        {[
          { key: 'basic', label: 'Basic Info', enabled: true },
          { key: 'lessons', label: 'Lessons', enabled: mode === 'edit' },
          { key: 'quizzes', label: 'Quizzes', enabled: mode === 'edit' },
          { key: 'review', label: 'Review', enabled: mode === 'edit' }
        ].map((step) => (
          <button
            key={step.key}
            onClick={() => step.enabled && setCurrentStep(step.key as any)}
            disabled={!step.enabled}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              currentStep === step.key
                ? 'border-blue-500 text-blue-600'
                : step.enabled
                ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                : 'border-transparent text-gray-300 cursor-not-allowed'
            }`}
          >
            {step.label}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderLessonsStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Lessons</h2>
        <button
          onClick={() => setCurrentStep('lessons')} // This would open a lesson builder modal
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No lessons added yet</p>
          <button
            onClick={() => {/* Open lesson builder */}}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div key={lesson.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{lesson.title}</h3>
                  <p className="text-sm text-gray-600">{lesson.type} • {lesson.duration} min</p>
                  {lesson.description && (
                    <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuizzesStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Quizzes</h2>
        <button
          onClick={() => {/* Open quiz builder */}}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No quizzes added yet</p>
          <button
            onClick={() => {/* Open quiz builder */}}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your First Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <div key={quiz.id || index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{quiz.title}</h3>
                  <p className="text-sm text-gray-600">
                    {quiz.questions?.length || 0} questions
                    {quiz.timeLimit && ` • ${quiz.timeLimit} min limit`}
                  </p>
                  {quiz.description && (
                    <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review & Publish</h2>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-semibold">Course Information</h3>
          <p><strong>Title:</strong> {courseData.title}</p>
          <p><strong>Audience:</strong> {courseData.audience}</p>
          <p><strong>Duration:</strong> {courseData.duration} hours</p>
          <p><strong>Passing Score:</strong> {courseData.passingScore}%</p>
        </div>

        <div>
          <h3 className="font-semibold">Content Summary</h3>
          <p><strong>Lessons:</strong> {lessons.length}</p>
          <p><strong>Quizzes:</strong> {quizzes.length}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setCurrentStep('basic')}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Edit
        </button>
        <button
          onClick={handlePublish}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish Course'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create New Course' : 'Edit Course'}
        </h1>
        {isDirty && (
          <p className="text-sm text-orange-600 mt-2">You have unsaved changes</p>
        )}
      </div>

      {renderStepNavigation()}

      <div className="bg-white">
        {currentStep === 'basic' && renderBasicInfo()}
        {currentStep === 'lessons' && renderLessonsStep()}
        {currentStep === 'quizzes' && renderQuizzesStep()}
        {currentStep === 'review' && renderReviewStep()}
      </div>
    </div>
  );
};

// Tag input component
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="border border-gray-300 rounded-md p-2 min-h-[42px] flex flex-wrap gap-2">
      {tags.map(tag => (
        <span
          key={tag}
          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none"
      />
    </div>
  );
};