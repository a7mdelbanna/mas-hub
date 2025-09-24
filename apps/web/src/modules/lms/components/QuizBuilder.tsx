import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { nanoid } from 'nanoid';

interface QuizBuilderProps {
  quiz?: Quiz;
  courseId?: string;
  lessonId?: string;
  onSave: (quizData: Partial<Quiz>) => void;
  onCancel: () => void;
}

interface QuizFormData {
  title: string;
  description: string;
  timeLimit?: number;
  attempts?: number;
  randomizeQuestions: boolean;
  showResults: boolean;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  quiz,
  courseId,
  lessonId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    timeLimit: undefined,
    attempts: undefined,
    randomizeQuestions: false,
    showResults: true
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        timeLimit: quiz.timeLimit,
        attempts: quiz.attempts,
        randomizeQuestions: quiz.randomizeQuestions,
        showResults: quiz.showResults
      });
      setQuestions(quiz.questions || []);
    }
  }, [quiz]);

  const handleFormChange = (field: keyof QuizFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Quiz title is required';
    }

    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    // Validate each question
    questions.forEach((question, index) => {
      if (!question.text.trim()) {
        newErrors[`question_${index}_text`] = 'Question text is required';
      }

      if (question.type === 'single_choice' || question.type === 'multiple_choice') {
        if (!question.options || question.options.length < 2) {
          newErrors[`question_${index}_options`] = 'At least 2 options are required';
        }
      }

      if (question.points <= 0) {
        newErrors[`question_${index}_points`] = 'Points must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const quizData: Partial<Quiz> = {
      ...formData,
      courseId,
      lessonId,
      questions
    };

    onSave(quizData);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: nanoid(),
      text: '',
      type: 'single_choice',
      options: ['Option 1', 'Option 2'],
      correctAnswer: 'Option 1',
      points: 1,
      explanation: ''
    };

    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    setQuestions(prev => prev.map((q, i) => i === index ? updatedQuestion : q));
  };

  const deleteQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (currentQuestionIndex === index) {
      setCurrentQuestionIndex(null);
    } else if (currentQuestionIndex !== null && currentQuestionIndex > index) {
      setCurrentQuestionIndex(prev => (prev as number) - 1);
    }
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicatedQuestion: Question = {
      ...questionToDuplicate,
      id: nanoid(),
      text: `${questionToDuplicate.text} (Copy)`
    };

    setQuestions(prev => [...prev.slice(0, index + 1), duplicatedQuestion, ...prev.slice(index + 1)]);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6">
          {quiz ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>

        {/* Quiz Settings */}
        <div className="mb-8 pb-8 border-b">
          <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Quiz Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter quiz title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
              <input
                type="number"
                value={formData.timeLimit || ''}
                onChange={(e) => handleFormChange('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="No time limit"
                min="1"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional quiz description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maximum Attempts</label>
              <input
                type="number"
                value={formData.attempts || ''}
                onChange={(e) => handleFormChange('attempts', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unlimited"
                min="1"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.randomizeQuestions}
                  onChange={(e) => handleFormChange('randomizeQuestions', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm">Randomize question order</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.showResults}
                  onChange={(e) => handleFormChange('showResults', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm">Show results after submission</span>
              </label>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">
              Questions ({questions.length})
            </h3>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Question
            </button>
          </div>

          {errors.questions && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.questions}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  isSelected={currentQuestionIndex === index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  onDuplicate={() => duplicateQuestion(index)}
                  onDelete={() => deleteQuestion(index)}
                  hasError={Object.keys(errors).some(key => key.startsWith(`question_${index}`))}
                />
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No questions added yet</p>
                  <button
                    onClick={addQuestion}
                    className="text-blue-600 hover:underline"
                  >
                    Add your first question
                  </button>
                </div>
              )}
            </div>

            {/* Question Editor */}
            <div className="lg:col-span-2">
              {currentQuestionIndex !== null ? (
                <QuestionEditor
                  question={questions[currentQuestionIndex]}
                  index={currentQuestionIndex}
                  onUpdate={(updatedQuestion) => updateQuestion(currentQuestionIndex, updatedQuestion)}
                  errors={errors}
                />
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                  <p>Select a question to edit, or add a new question to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 border-t pt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {quiz ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Question Item Component
interface QuestionItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  hasError: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  isSelected,
  onClick,
  onDuplicate,
  onDelete,
  hasError
}) => {
  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : hasError
          ? 'border-red-300 bg-red-50'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-500 mr-2">Q{index + 1}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {question.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500 ml-2">{question.points} pts</span>
          </div>
          <p className="text-sm text-gray-900 truncate">
            {question.text || 'Untitled question'}
          </p>
        </div>

        <div className="flex space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V9a1 1 0 00-1-1H8a1 1 0 00-1 1v2.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L5 11.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Question Editor Component
interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  errors: Record<string, string>;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onUpdate,
  errors
}) => {
  const handleChange = (field: keyof Question, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onUpdate({ ...question, options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
    onUpdate({ ...question, options: newOptions });

    // Update correct answer if it was the removed option
    if (question.correctAnswer === question.options?.[optionIndex]) {
      onUpdate({ ...question, options: newOptions, correctAnswer: newOptions[0] || '' });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-medium mb-4">Edit Question {index + 1}</h4>

      <div className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Question Text *</label>
          <textarea
            value={question.text}
            onChange={(e) => handleChange('text', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[`question_${index}_text`] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your question here..."
          />
          {errors[`question_${index}_text`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`question_${index}_text`]}</p>
          )}
        </div>

        {/* Question Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Question Type</label>
            <select
              value={question.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single_choice">Single Choice</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="text">Text Answer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Points *</label>
            <input
              type="number"
              value={question.points}
              onChange={(e) => handleChange('points', parseInt(e.target.value) || 1)}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors[`question_${index}_points`] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors[`question_${index}_points`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`question_${index}_points`]}</p>
            )}
          </div>
        </div>

        {/* Options (for choice questions) */}
        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <div>
            <label className="block text-sm font-medium mb-2">Answer Options</label>
            <div className="space-y-3">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-3">
                  <input
                    type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                    name={`correct_${question.id}`}
                    checked={
                      question.type === 'single_choice'
                        ? question.correctAnswer === option
                        : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)
                    }
                    onChange={(e) => {
                      if (question.type === 'single_choice') {
                        handleChange('correctAnswer', option);
                      } else {
                        const currentCorrect = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                        if (e.target.checked) {
                          handleChange('correctAnswer', [...currentCorrect, option]);
                        } else {
                          handleChange('correctAnswer', currentCorrect.filter(a => a !== option));
                        }
                      }
                    }}
                    className="text-green-600"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <button
                    onClick={() => removeOption(optionIndex)}
                    disabled={question.options!.length <= 2}
                    className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {errors[`question_${index}_options`] && (
              <p className="mt-1 text-sm text-red-600">{errors[`question_${index}_options`]}</p>
            )}

            <button
              onClick={addOption}
              className="mt-3 px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            >
              Add Option
            </button>
          </div>
        )}

        {/* True/False correct answer */}
        {question.type === 'true_false' && (
          <div>
            <label className="block text-sm font-medium mb-2">Correct Answer</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={question.correctAnswer === true}
                  onChange={() => handleChange('correctAnswer', true)}
                  className="text-green-600"
                />
                <span className="ml-2">True</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={question.correctAnswer === false}
                  onChange={() => handleChange('correctAnswer', false)}
                  className="text-green-600"
                />
                <span className="ml-2">False</span>
              </label>
            </div>
          </div>
        )}

        {/* Text answer */}
        {question.type === 'text' && (
          <div>
            <label className="block text-sm font-medium mb-2">Sample/Expected Answer</label>
            <input
              type="text"
              value={question.correctAnswer as string || ''}
              onChange={(e) => handleChange('correctAnswer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter expected answer (for reference)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Text answers will need to be graded manually
            </p>
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium mb-2">Explanation (Optional)</label>
          <textarea
            value={question.explanation || ''}
            onChange={(e) => handleChange('explanation', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Explain the correct answer..."
          />
        </div>
      </div>
    </div>
  );
};