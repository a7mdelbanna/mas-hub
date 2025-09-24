import { Quiz, Question } from '../types';

export interface GradingResult {
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  questionResults: QuestionResult[];
  passed: boolean;
  timeSpent?: number;
}

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  earnedPoints: number;
  maxPoints: number;
  userAnswer: any;
  correctAnswer: any;
  explanation?: string;
}

export class QuizGrader {
  /**
   * Grade a quiz submission
   */
  static gradeQuiz(
    quiz: Quiz,
    answers: Record<string, any>,
    passingScore: number = 70,
    startTime?: Date,
    endTime?: Date
  ): GradingResult {
    const questionResults: QuestionResult[] = [];
    let totalPoints = 0;
    let earnedPoints = 0;

    // Grade each question
    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const questionResult = this.gradeQuestion(question, userAnswer);

      questionResults.push(questionResult);
      totalPoints += question.points;
      earnedPoints += questionResult.earnedPoints;
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= passingScore;

    const timeSpent = startTime && endTime
      ? Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60) // minutes
      : undefined;

    return {
      totalPoints,
      earnedPoints,
      percentage,
      questionResults,
      passed,
      timeSpent
    };
  }

  /**
   * Grade an individual question
   */
  private static gradeQuestion(question: Question, userAnswer: any): QuestionResult {
    const isCorrect = this.isAnswerCorrect(question, userAnswer);
    const earnedPoints = isCorrect ? question.points : 0;

    return {
      questionId: question.id,
      correct: isCorrect,
      earnedPoints,
      maxPoints: question.points,
      userAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    };
  }

  /**
   * Check if an answer is correct based on question type
   */
  private static isAnswerCorrect(question: Question, userAnswer: any): boolean {
    // Handle null/undefined answers
    if (userAnswer === null || userAnswer === undefined) {
      return false;
    }

    switch (question.type) {
      case 'single_choice':
        return this.gradeSingleChoice(question.correctAnswer as string, userAnswer);

      case 'multiple_choice':
        return this.gradeMultipleChoice(question.correctAnswer as string[], userAnswer);

      case 'true_false':
        return this.gradeTrueFalse(question.correctAnswer as boolean, userAnswer);

      case 'text':
        return this.gradeTextAnswer(question.correctAnswer as string, userAnswer);

      default:
        console.warn(`Unknown question type: ${question.type}`);
        return false;
    }
  }

  /**
   * Grade single choice question
   */
  private static gradeSingleChoice(correctAnswer: string, userAnswer: any): boolean {
    return typeof userAnswer === 'string' && userAnswer.trim() === correctAnswer.trim();
  }

  /**
   * Grade multiple choice question
   */
  private static gradeMultipleChoice(correctAnswers: string[], userAnswer: any): boolean {
    if (!Array.isArray(userAnswer)) {
      return false;
    }

    // Sort both arrays for comparison
    const sortedCorrect = [...correctAnswers].sort();
    const sortedUser = [...userAnswer].sort();

    if (sortedCorrect.length !== sortedUser.length) {
      return false;
    }

    return sortedCorrect.every((answer, index) =>
      answer.trim() === sortedUser[index]?.trim()
    );
  }

  /**
   * Grade true/false question
   */
  private static gradeTrueFalse(correctAnswer: boolean, userAnswer: any): boolean {
    return typeof userAnswer === 'boolean' && userAnswer === correctAnswer;
  }

  /**
   * Grade text answer (with flexible matching)
   */
  private static gradeTextAnswer(correctAnswer: string, userAnswer: any): boolean {
    if (typeof userAnswer !== 'string') {
      return false;
    }

    const correct = correctAnswer.toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();

    // Exact match
    if (correct === user) {
      return true;
    }

    // Check if user answer contains the correct answer
    if (user.includes(correct) && correct.length > 3) {
      return true;
    }

    // Simple fuzzy matching for common variations
    return this.fuzzyMatch(correct, user);
  }

  /**
   * Simple fuzzy matching for text answers
   */
  private static fuzzyMatch(correct: string, user: string): boolean {
    // Remove common punctuation and extra spaces
    const normalize = (text: string) =>
      text.replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();

    const normalizedCorrect = normalize(correct);
    const normalizedUser = normalize(user);

    if (normalizedCorrect === normalizedUser) {
      return true;
    }

    // Check for partial matches on longer answers
    if (normalizedCorrect.length > 10) {
      const words = normalizedCorrect.split(' ');
      const userWords = normalizedUser.split(' ');
      const matchedWords = words.filter(word =>
        word.length > 2 && userWords.some(userWord =>
          userWord.includes(word) || word.includes(userWord)
        )
      );

      // Consider it correct if most key words are present
      return matchedWords.length >= Math.ceil(words.length * 0.7);
    }

    return false;
  }

  /**
   * Calculate detailed quiz statistics
   */
  static calculateQuizStatistics(results: GradingResult[]): {
    averageScore: number;
    highScore: number;
    lowScore: number;
    passRate: number;
    averageTime: number;
    questionDifficulty: Array<{
      questionId: string;
      correctPercentage: number;
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
  } {
    if (results.length === 0) {
      return {
        averageScore: 0,
        highScore: 0,
        lowScore: 0,
        passRate: 0,
        averageTime: 0,
        questionDifficulty: []
      };
    }

    const scores = results.map(r => r.percentage);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highScore = Math.max(...scores);
    const lowScore = Math.min(...scores);
    const passRate = Math.round((results.filter(r => r.passed).length / results.length) * 100);

    const timesSpent = results.filter(r => r.timeSpent).map(r => r.timeSpent!);
    const averageTime = timesSpent.length > 0
      ? Math.round(timesSpent.reduce((a, b) => a + b, 0) / timesSpent.length)
      : 0;

    // Calculate question difficulty
    const questionStats = new Map<string, { correct: number; total: number }>();

    results.forEach(result => {
      result.questionResults.forEach(qr => {
        const stats = questionStats.get(qr.questionId) || { correct: 0, total: 0 };
        stats.total++;
        if (qr.correct) stats.correct++;
        questionStats.set(qr.questionId, stats);
      });
    });

    const questionDifficulty = Array.from(questionStats.entries()).map(([questionId, stats]) => {
      const correctPercentage = Math.round((stats.correct / stats.total) * 100);
      let difficulty: 'easy' | 'medium' | 'hard';

      if (correctPercentage >= 80) difficulty = 'easy';
      else if (correctPercentage >= 60) difficulty = 'medium';
      else difficulty = 'hard';

      return { questionId, correctPercentage, difficulty };
    });

    return {
      averageScore,
      highScore,
      lowScore,
      passRate,
      averageTime,
      questionDifficulty
    };
  }

  /**
   * Generate feedback based on quiz results
   */
  static generateFeedback(result: GradingResult, quiz: Quiz): {
    overallFeedback: string;
    questionFeedback: Array<{
      questionId: string;
      feedback: string;
    }>;
    recommendations: string[];
  } {
    const overallFeedback = this.getOverallFeedback(result);
    const questionFeedback = result.questionResults.map(qr => ({
      questionId: qr.questionId,
      feedback: this.getQuestionFeedback(qr)
    }));
    const recommendations = this.getRecommendations(result, quiz);

    return {
      overallFeedback,
      questionFeedback,
      recommendations
    };
  }

  private static getOverallFeedback(result: GradingResult): string {
    const { percentage, passed } = result;

    if (passed) {
      if (percentage >= 95) {
        return "Excellent work! You've mastered this material.";
      } else if (percentage >= 85) {
        return "Great job! You have a strong understanding of the content.";
      } else {
        return "Good work! You've passed and understand the key concepts.";
      }
    } else {
      if (percentage >= 60) {
        return "You're close! Review the material and try again.";
      } else if (percentage >= 40) {
        return "You need to spend more time with the material before retaking.";
      } else {
        return "Consider reviewing the course content thoroughly before your next attempt.";
      }
    }
  }

  private static getQuestionFeedback(questionResult: QuestionResult): string {
    if (questionResult.correct) {
      return "Correct! " + (questionResult.explanation || "");
    } else {
      let feedback = "Incorrect. ";
      if (questionResult.explanation) {
        feedback += questionResult.explanation;
      } else {
        feedback += `The correct answer was: ${questionResult.correctAnswer}`;
      }
      return feedback;
    }
  }

  private static getRecommendations(result: GradingResult, quiz: Quiz): string[] {
    const recommendations: string[] = [];
    const { percentage, passed, questionResults } = result;

    if (!passed) {
      recommendations.push("Retake the quiz after reviewing the course material");

      // Find areas of weakness
      const incorrectQuestions = questionResults.filter(qr => !qr.correct);
      if (incorrectQuestions.length > questionResults.length * 0.5) {
        recommendations.push("Consider reviewing all course lessons before retaking");
      } else {
        recommendations.push("Focus on the specific topics where you had incorrect answers");
      }
    }

    if (result.timeSpent && quiz.timeLimit && result.timeSpent > quiz.timeLimit * 0.9) {
      recommendations.push("Consider practicing time management for future quizzes");
    }

    if (percentage < 80 && passed) {
      recommendations.push("Consider reviewing the material to strengthen your understanding");
    }

    return recommendations;
  }
}