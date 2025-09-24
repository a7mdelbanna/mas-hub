import React, { useState, useEffect } from 'react';
import { LearnerDashboard } from './LearnerDashboard';
import { CourseList } from './CourseList';
import { useCourses } from '../hooks/useCourses';
import { useAssignments } from '../hooks/useAssignments';
import { Course, Assignment } from '../types';

interface ClientTrainingProps {
  clientId: string;
  clientName: string;
  products: Array<{ id: string; name: string; }>;
}

export const ClientTraining: React.FC<ClientTrainingProps> = ({
  clientId,
  clientName,
  products
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'product-training' | 'general'>('overview');
  const [productCourses, setProductCourses] = useState<Record<string, Course[]>>({});
  const [generalCourses, setGeneralCourses] = useState<Course[]>([]);
  const [clientAssignments, setClientAssignments] = useState<Assignment[]>([]);

  const { searchCourses, getCoursesByAudience } = useCourses();
  const { getClientAssignments } = useAssignments();

  useEffect(() => {
    loadClientTraining();
  }, [clientId]);

  const loadClientTraining = async () => {
    try {
      // Load client assignments
      const assignments = await getClientAssignments(clientId);
      setClientAssignments(assignments);

      // Load general client courses
      const generalClientCourses = await getCoursesByAudience('client');
      setGeneralCourses(generalClientCourses.filter(course => !course.productId));

      // Load product-specific courses
      const productCoursesData: Record<string, Course[]> = {};
      for (const product of products) {
        const productSpecificCourses = await searchCourses({
          audience: 'client',
          productId: product.id
        });
        productCoursesData[product.id] = productSpecificCourses;
      }
      setProductCourses(productCoursesData);

    } catch (error) {
      console.error('Error loading client training:', error);
    }
  };

  const getTotalProductCourses = () => {
    return Object.values(productCourses).flat().length;
  };

  const getCompletedAssignments = () => {
    return clientAssignments.filter(a => a.status === 'completed').length;
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Training Portal, {clientName}!</h2>
        <p className="text-blue-100 mb-6">
          Access product training, user guides, and best practices to get the most out of your MAS solutions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Product Training</h3>
            <p className="text-sm text-blue-100">
              Learn to use your purchased products effectively
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Best Practices</h3>
            <p className="text-sm text-blue-100">
              Discover tips and tricks from our experts
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Support Resources</h3>
            <p className="text-sm text-blue-100">
              Access additional help and documentation
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <p className="text-gray-600">Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{getTotalProductCourses()}</p>
              <p className="text-gray-600">Training Courses</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{getCompletedAssignments()}</p>
              <p className="text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{clientAssignments.length - getCompletedAssignments()}</p>
              <p className="text-gray-600">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity or Dashboard */}
      <LearnerDashboard
        learnerId={clientId}
        learnerType="client"
        learnerName={clientName}
      />
    </div>
  );

  const renderProductTraining = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Training</h2>
        <p className="text-gray-600">
          Training specific to your purchased products
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-500">
            Contact your account manager to set up product-specific training.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {productCourses[product.id]?.length || 0} courses
                  </span>
                </div>
              </div>

              <div className="p-6">
                {!productCourses[product.id] || productCourses[product.id].length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No training courses available for this product yet.</p>
                    <p className="text-sm mt-2">Check back later for updates.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productCourses[product.id].map(course => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium mb-2">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">
                            {course.duration ? `${course.duration} hours` : 'Self-paced'}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 font-medium">
                            Start Course
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGeneralTraining = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">General Training</h2>
        <p className="text-gray-600">
          General best practices and platform usage
        </p>
      </div>

      {generalCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No General Courses Available</h3>
          <p className="text-gray-500">
            General training courses will be available soon.
          </p>
        </div>
      ) : (
        <CourseList
          audience="client"
          allowCreate={false}
        />
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'product-training':
        return renderProductTraining();
      case 'general':
        return renderGeneralTraining();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Training Portal</h1>
        <p className="text-gray-600 mt-2">
          Access training materials and resources for your MAS products and services
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'product-training', label: 'Product Training', icon: '🔧' },
            { key: 'general', label: 'General Training', icon: '📚' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Support Section */}
      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Need Additional Support?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C17.759 8.071 18 9.007 18 10zm-9.615 3.615L7 12.229c-.993-.241-1.929-.668-2.754-1.138l1.525-1.524c.65.026 1.37.096 2.183-.078l1.562 1.562zm-2.183-7.075l-1.562-1.562C8.071 4.241 9.007 4 10 4s1.929.241 2.754.668L11.23 6.193a3.997 3.997 0 00-2.183.078L7.615 4.847zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-medium mb-2">Technical Support</h4>
            <p className="text-sm text-gray-600">
              Get help with technical issues and product usage
            </p>
            <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Contact Support
            </button>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="font-medium mb-2">Account Manager</h4>
            <p className="text-sm text-gray-600">
              Discuss training needs and additional resources
            </p>
            <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
              Contact Manager
            </button>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v3a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 00-1 1v5.5a1.5 1.5 0 01-3 0V9a2 2 0 012-2h1V7z" />
              </svg>
            </div>
            <h4 className="font-medium mb-2">Documentation</h4>
            <p className="text-sm text-gray-600">
              Access detailed product documentation and guides
            </p>
            <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};