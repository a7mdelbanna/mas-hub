import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Course, CourseAudience, CourseSearchParams } from '../types';
import { useCourses } from '../hooks/useCourses';

interface CourseListProps {
  audience?: CourseAudience;
  allowCreate?: boolean;
  onCourseSelect?: (course: Course) => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  audience,
  allowCreate = false,
  onCourseSelect
}) => {
  const { courses, searchCourses, loading } = useCourses();
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    searchTerm: '',
    audience,
    tags: [],
    productId: ''
  });
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    loadCourses();
  }, [audience]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchParams]);

  const loadCourses = async () => {
    try {
      await searchCourses(audience ? { audience } : {});
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchParams.searchTerm) {
      const term = searchParams.searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
      );
    }

    if (searchParams.tags && searchParams.tags.length > 0) {
      filtered = filtered.filter(course =>
        course.tags?.some(tag => searchParams.tags!.includes(tag))
      );
    }

    if (searchParams.productId) {
      filtered = filtered.filter(course => course.productId === searchParams.productId);
    }

    setFilteredCourses(filtered);
  };

  const handleSearch = (field: keyof CourseSearchParams, value: any) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const getAudienceBadgeColor = (audience: CourseAudience) => {
    switch (audience) {
      case CourseAudience.EMPLOYEE:
        return 'bg-blue-100 text-blue-800';
      case CourseAudience.CANDIDATE:
        return 'bg-green-100 text-green-800';
      case CourseAudience.CLIENT:
        return 'bg-purple-100 text-purple-800';
      case CourseAudience.MIXED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Duration not set';
    if (duration < 1) return `${Math.round(duration * 60)} min`;
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {audience ? `${audience.charAt(0).toUpperCase() + audience.slice(1)} Courses` : 'All Courses'}
        </h2>
        {allowCreate && (
          <Link
            to="/lms/courses/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Course
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              value={searchParams.searchTerm || ''}
              onChange={(e) => handleSearch('searchTerm', e.target.value)}
              placeholder="Search courses..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!audience && (
            <div>
              <label className="block text-sm font-medium mb-1">Audience</label>
              <select
                value={searchParams.audience || ''}
                onChange={(e) => handleSearch('audience', e.target.value as CourseAudience || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Audiences</option>
                <option value={CourseAudience.EMPLOYEE}>Employee</option>
                <option value={CourseAudience.CANDIDATE}>Candidate</option>
                <option value={CourseAudience.CLIENT}>Client</option>
                <option value={CourseAudience.MIXED}>Mixed</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <input
              type="text"
              value={searchParams.productId || ''}
              onChange={(e) => handleSearch('productId', e.target.value)}
              placeholder="Filter by product..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 mb-4">
        {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 mb-4">
            {searchParams.searchTerm || searchParams.audience || searchParams.productId
              ? 'Try adjusting your search criteria'
              : 'No courses have been created yet'}
          </p>
          {allowCreate && (
            <Link
              to="/lms/courses/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={() => onCourseSelect?.(course)}
              showManageButton={allowCreate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CourseCardProps {
  course: Course;
  onSelect?: () => void;
  showManageButton?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelect,
  showManageButton = false
}) => {
  const getAudienceBadgeColor = (audience: CourseAudience) => {
    switch (audience) {
      case CourseAudience.EMPLOYEE:
        return 'bg-blue-100 text-blue-800';
      case CourseAudience.CANDIDATE:
        return 'bg-green-100 text-green-800';
      case CourseAudience.CLIENT:
        return 'bg-purple-100 text-purple-800';
      case CourseAudience.MIXED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    if (duration < 1) return `${Math.round(duration * 60)} min`;
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-4xl">📚</div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg leading-tight">{course.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getAudienceBadgeColor(course.audience)}`}>
            {course.audience}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description || 'No description available'}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          {formatDuration(course.duration) && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatDuration(course.duration)}
            </span>
          )}

          {course.passingScore && (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {course.passingScore}% to pass
            </span>
          )}
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {course.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{course.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {course.active ? (
              <span className="text-green-600 font-medium">Published</span>
            ) : (
              <span className="text-orange-600 font-medium">Draft</span>
            )}
          </div>

          <div className="flex space-x-2">
            {onSelect && (
              <button
                onClick={onSelect}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select
              </button>
            )}

            {showManageButton && (
              <Link
                to={`/lms/courses/${course.id}`}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Manage
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};