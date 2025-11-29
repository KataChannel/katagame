'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Gift, Flame, Award, Sparkles } from 'lucide-react';
import apolloClient from '@/lib/apolloClient';
import { SUBMIT_QUIZ } from '@/lib/graphql/queries';
import { QuizSubmissionResult } from '@/lib/types/mvp1.types';
import dynamic from 'next/dynamic';

// Dynamic import for Confetti to avoid SSR issues
// @ts-ignore - react-confetti doesn't have type definitions
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface QuizFormProps {
  storyId: string;
  questions: Array<{
    id: string;
    questionNumber: number;
    question: string;
    options: string[];
  }>;
  onComplete: (result: QuizSubmissionResult) => void;
}

export default function QuizForm({ storyId, questions, onComplete }: QuizFormProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSelectAnswer = (questionNumber: number, answer: number) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const answersArray = questions.map(q => ({
        questionNumber: q.questionNumber,
        selectedAnswer: answers[q.questionNumber] || 0,
      }));

      const { data } = await apolloClient.mutate<{ submitQuiz: QuizSubmissionResult }>({
        mutation: SUBMIT_QUIZ,
        variables: {
          input: {
            storyId,
            answers: answersArray,
            timeTaken: 0,
          },
        },
      });

      const submissionResult = data?.submitQuiz;
      if (!submissionResult) {
        throw new Error('Không nhận được kết quả từ server');
      }
      
      setResult(submissionResult);

      // Show confetti if perfect score
      if (submissionResult.isPerfect) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      // Call onComplete after showing result
      setTimeout(() => {
        onComplete(submissionResult);
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      alert('Có lỗi khi nộp bài: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = questions.every(q => answers[q.questionNumber] !== undefined);

  if (result) {
    return <QuizResultDialog result={result} showConfetti={showConfetti} />;
  }

  return (
    <div className="space-y-6">
      {/* x5 Multiplier Indicator */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <Gift className="w-8 h-8 text-yellow-400" />
          <div>
            <h3 className="text-lg font-bold text-yellow-400">
              🎁 Trả lời đúng tất cả = x5 phần thưởng!
            </h3>
            <p className="text-sm text-gray-300">
              Hoàn hảo: {questions.length}/{questions.length} câu đúng → Nhận gấp 5 lần phần thưởng
            </p>
          </div>
        </div>
      </motion.div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30"
          >
            <h4 className="font-bold text-white mb-3">
              {question.questionNumber}. {question.question}
            </h4>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleSelectAnswer(question.questionNumber, optionIndex)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    answers[question.questionNumber] === optionIndex
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100'
                      : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-semibold mr-2">
                    {String.fromCharCode(65 + optionIndex)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: allAnswered ? 1.02 : 1 }}
        whileTap={{ scale: allAnswered ? 0.98 : 1 }}
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
          allAnswered && !submitting
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {submitting ? '⏳ Đang nộp bài...' : '✅ Nộp bài'}
      </motion.button>

      {!allAnswered && (
        <p className="text-center text-sm text-orange-300">
          ⚠️ Vui lòng trả lời đủ {questions.length} câu hỏi
        </p>
      )}
    </div>
  );
}

interface QuizResultDialogProps {
  result: QuizSubmissionResult;
  showConfetti: boolean;
}

function QuizResultDialog({ result, showConfetti }: QuizResultDialogProps) {
  const multiplierText = result.multiplier === 5 ? 'x5' : 'x1';
  const isPerfect = result.isPerfect;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* Confetti Effect */}
      {/* @ts-ignore - react-confetti props not properly typed */}
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={500} />}

      <div
        className={`rounded-xl p-8 border-4 ${
          isPerfect
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400'
            : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400'
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {isPerfect ? (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Award className="w-24 h-24 text-yellow-400" />
            </motion.div>
          ) : (
            <CheckCircle className="w-24 h-24 text-blue-400" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-4">
          {isPerfect ? (
            <span className="text-yellow-400">🎉 HOÀN HẢO!</span>
          ) : (
            <span className="text-blue-400">✅ Hoàn thành</span>
          )}
        </h2>

        {/* Score */}
        <div className="text-center mb-6">
          <p className="text-6xl font-bold text-white mb-2">
            {result.correctCount}/{result.totalQuestions}
          </p>
          <p className="text-gray-300">câu đúng</p>
        </div>

        {/* Multiplier Badge */}
        <div
          className={`flex items-center justify-center gap-2 p-4 rounded-lg mb-6 ${
            isPerfect ? 'bg-yellow-500/20' : 'bg-gray-700/50'
          }`}
        >
          <Sparkles className={isPerfect ? 'text-yellow-400' : 'text-gray-400'} />
          <span className="text-2xl font-bold text-white">{multiplierText}</span>
          <span className="text-gray-300">Hệ số nhân thưởng</span>
        </div>

        {/* Rewards */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">PHẦN THƯỞNG NHẬN ĐƯỢC:</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">💰 Vàng:</span>
              <span className="text-2xl font-bold text-yellow-400">
                +{result.rewards.gold}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">🍚 Gạo:</span>
              <span className="text-2xl font-bold text-green-400">
                +{result.rewards.rice}
              </span>
            </div>
            {result.rewards.wood && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">🌳 Gỗ:</span>
                <span className="text-2xl font-bold text-amber-400">
                  +{result.rewards.wood}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Perfect Streak */}
        {result.perfectStreak && result.perfectStreak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/50 rounded-lg p-3"
          >
            <Flame className="w-6 h-6 text-red-400" />
            <span className="text-lg font-bold text-white">
              🔥 Chuỗi hoàn hảo: {result.perfectStreak} lần!
            </span>
          </motion.div>
        )}

        {/* Encouragement Message */}
        <p className="text-center text-gray-300 mt-6">
          {isPerfect
            ? '👏 Xuất sắc! Bạn đã nắm vững kiến thức lịch sử!'
            : '💪 Học thêm và thử lại để đạt điểm hoàn hảo x5!'}
        </p>
      </div>
    </motion.div>
  );
}
