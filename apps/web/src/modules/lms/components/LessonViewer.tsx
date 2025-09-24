import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';

interface LessonViewerProps {
  lesson: Lesson;
  nextLesson?: Lesson;
  previousLesson?: Lesson;
  completed?: boolean;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  nextLesson,
  previousLesson,
  completed = false,
  onComplete,
  onNext,
  onPrevious
}) => {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  const handleMarkComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      case 'article':
        return '📖';
      case 'interactive':
        return '💻';
      default:
        return '📚';
    }
  };

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return <VideoPlayer url={lesson.url} onProgress={setProgress} />;
      case 'document':
        return <PDFViewer url={lesson.url} />;
      case 'article':
        return <ArticleViewer content={lesson.content} />;
      case 'interactive':
        return <InteractiveContent url={lesson.url} />;
      default:
        return <div className="text-center py-12 text-gray-500">Unsupported lesson type</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-3xl mr-4">{getLessonIcon(lesson.type)}</span>
            <div>
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <div className="flex items-center text-gray-600 mt-1">
                <span className="capitalize">{lesson.type}</span>
                {lesson.duration && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{lesson.duration} minutes</span>
                  </>
                )}
                {lesson.required && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-red-600 font-medium">Required</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Progress indicator */}
            {lesson.type === 'video' && progress > 0 && (
              <div className="text-sm text-gray-600">
                Progress: {Math.round(progress)}%
              </div>
            )}

            {/* Completion status */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCompleted
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isCompleted ? 'Completed' : 'In Progress'}
            </div>
          </div>
        </div>

        {/* Description */}
        {lesson.description && (
          <p className="text-gray-600 mb-4">{lesson.description}</p>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-4">
          <div className="flex space-x-3">
            {previousLesson && (
              <button
                onClick={onPrevious}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {!isCompleted && (
              <button
                onClick={handleMarkComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Mark as Complete
              </button>
            )}

            {nextLesson && (
              <button
                onClick={onNext}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {renderLessonContent()}
      </div>
    </div>
  );
};

// Video Player Component
interface VideoPlayerProps {
  url?: string;
  onProgress?: (progress: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onProgress }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const progress = duration > 0 ? (video.currentTime / duration) * 100 : 0;
    setCurrentTime(video.currentTime);
    onProgress?.(progress);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  };

  if (!url) {
    return (
      <div className="aspect-video flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No video URL provided</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        src={url}
        controls
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <p className="text-center p-4 text-gray-500">
          Your browser doesn't support video playback.
        </p>
      </video>

      {/* Progress bar overlay */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
          {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
};

// PDF Viewer Component
interface PDFViewerProps {
  url?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  if (!url) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No document URL provided</p>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <iframe
        src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full"
        title="PDF Document"
      >
        <p className="p-4 text-center">
          Your browser doesn't support PDF viewing.{' '}
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Download the PDF
          </a>
        </p>
      </iframe>
    </div>
  );
};

// Article Viewer Component
interface ArticleViewerProps {
  content?: string;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ content }) => {
  if (!content) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No article content available</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

// Interactive Content Component
interface InteractiveContentProps {
  url?: string;
}

export const InteractiveContent: React.FC<InteractiveContentProps> = ({ url }) => {
  if (!url) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No interactive content URL provided</p>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <iframe
        src={url}
        className="w-full h-full"
        title="Interactive Content"
        sandbox="allow-scripts allow-same-origin allow-forms"
      >
        <p className="p-4 text-center">
          Your browser doesn't support embedded content.{' '}
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Open in new tab
          </a>
        </p>
      </iframe>
    </div>
  );
};