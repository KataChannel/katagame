/**
 * Story Detail Page - Chi tiết câu chuyện + Quiz
 * MVP2 Sprint 1: Quiz x5 Multiplier System
 * 
 * Features:
 * - Hiển thị nội dung câu chuyện lịch sử
 * - Form quiz với x5 reward indicator
 * - Confetti animation khi đạt điểm hoàn hảo
 * - Hiển thị perfect streak và rewards
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Brain } from 'lucide-react';
import QuizForm from '@/components/stories/QuizForm';
import apolloClient from '@/lib/apolloClient';
import { gql } from '@apollo/client';
import type { Story, Quiz, QuizSubmissionResult } from '@/lib/types/mvp1.types';

const GET_STORY_WITH_QUIZ = gql`
  query GetStoryWithQuiz($id: ID!) {
    story(id: $id) {
      id
      title
      content
      era
      difficulty
      day
      imageUrl
      quiz {
        id
        questions {
          id
          questionText
          options
          correctAnswer
          explanation
        }
      }
    }
  }
`;

interface Props {
  params: {
    id: string;
  };
}

export default function StoryDetailPage({ params }: Props) {
  const [story, setStory] = useState<Story | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [params.id]);

  const loadStory = async () => {
    try {
      const { data } = await apolloClient.query<{ story: Story & { quiz: Quiz } }>({
        query: GET_STORY_WITH_QUIZ,
        variables: { id: params.id },
      });

      if (data?.story) {
        setStory(data.story);
        setQuiz(data.story.quiz);
      }
    } catch (error) {
      console.error('Error loading story:', error);
      alert('Không thể tải câu chuyện');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (result: QuizSubmissionResult) => {
    console.log('Quiz completed:', result);
    
    // Show result summary
    setTimeout(() => {
      if (confirm('Bạn muốn quay lại danh sách câu chuyện?')) {
        window.location.href = '/stories';
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Đang tải câu chuyện...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Không tìm thấy câu chuyện</p>
          <button
            onClick={() => window.location.href = '/stories'}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => window.location.href = '/stories'}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </motion.button>

        {/* Story Content */}
        {!showQuiz ? (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            {/* Story Header */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-start gap-4 mb-4">
                <BookOpen className="w-10 h-10 text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {story.title}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm">
                      {story.era}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm">
                      Ngày {story.day}
                    </span>
                    <span className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-sm">
                      Câu chuyện lịch sử
                    </span>
                  </div>
                </div>
              </div>

              {/* Story Image - placeholder for future */}

              {/* Story Content */}
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-purple-100 leading-relaxed whitespace-pre-wrap">
                  {story.content}
                </p>
              </div>
            </div>

            {/* Start Quiz Button */}
            {quiz && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setShowQuiz(true)}
                className="w-full py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl transform transition-all hover:scale-105"
              >
                <Brain className="w-8 h-8" />
                Bắt đầu Quiz - Cơ hội nhận x5 phần thưởng! 🎁
              </motion.button>
            )}
          </motion.div>
        ) : (
          /* Quiz Form */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {quiz && (
              <QuizForm
                storyId={story.id}
                questions={quiz.questions.map((q, idx) => ({
                  id: q.id,
                  questionNumber: idx + 1,
                  question: q.question,
                  options: q.options
                }))}
                onComplete={handleQuizComplete}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
