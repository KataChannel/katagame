'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Award, Users, Star, CheckCircle, Lock, ChevronRight, Trophy, Sparkles, Clock, Target } from 'lucide-react';
import { getEducationalSystem, EducationalQuest, HistoricalFigure, CulturalBadge, Dynasty } from '@/lib/educationalSystem';
import { useGameStore } from '@/lib/gameStore';

type TabType = 'quests' | 'figures' | 'badges' | 'progress';

export default function EducationalTab() {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('quests');
  const [selectedDynasty, setSelectedDynasty] = useState<Dynasty | 'all'>('all');
  const [quests, setQuests] = useState<EducationalQuest[]>([]);
  const [figures, setFigures] = useState<HistoricalFigure[]>([]);
  const [badges, setBadges] = useState<CulturalBadge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<CulturalBadge[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [selectedQuest, setSelectedQuest] = useState<EducationalQuest | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  useEffect(() => {
    initializePlayer();
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [player.id]);

  const initializePlayer = () => {
    const system = getEducationalSystem();
    if (!system.getPlayerProgress(player.id)) {
      system.initializePlayerProgress(player.id);
    }
  };

  const refreshData = () => {
    const system = getEducationalSystem();
    setQuests(system.getAllQuests());
    setFigures(system.getAllFigures());
    setBadges(system.getAllBadges());
    setUnlockedBadges(system.getUnlockedBadges(player.id));
    setProgress(system.getPlayerProgress(player.id));
  };

  const handleStartQuest = (quest: EducationalQuest) => {
    const system = getEducationalSystem();
    if (system.startQuest(player.id, quest.id)) {
      setSelectedQuest(quest);
      setCurrentChapter(0);
      refreshData();
    }
  };

  const handleCompleteChapter = () => {
    if (!selectedQuest) return;
    const system = getEducationalSystem();
    const result = system.completeChapter(player.id, selectedQuest.id, currentChapter);
    
    if (result?.chapterComplete) {
      if (result.nextChapter < selectedQuest.chapters.length) {
        setCurrentChapter(result.nextChapter);
      } else {
        alert(`Quest completed! +${selectedQuest.rewards.culturePoints} Culture Points`);
        setSelectedQuest(null);
      }
      refreshData();
    }
  };

  const handleQuizAnswer = (answer: number) => {
    if (!selectedQuest) return;
    const chapter = selectedQuest.chapters[currentChapter];
    const quiz = chapter.quiz;
    if (!quiz) return;
    
    const system = getEducationalSystem();
    const result = system.submitQuizAnswer(player.id, selectedQuest.id, quiz.id, answer);
    
    if (result?.correct) {
      alert(`Correct! Score: ${result.score}%\n${result.explanation}`);
      handleCompleteChapter();
    } else {
      alert(`Incorrect. ${result.attemptsLeft} attempts left.${result.explanation ? '\n' + result.explanation : ''}`);
    }
  };

  const getDynastyColor = (dynasty: Dynasty) => {
    const colors = {
      hung_kings: '#8B4513',
      ly: '#FFD700',
      tran: '#4169E1',
      le: '#DC143C',
      nguyen: '#9370DB',
      modern: '#FF4500',
    };
    return colors[dynasty];
  };

  const dynasties = [
    { id: 'all' as const, label: 'All' },
    { id: 'hung_kings' as Dynasty, label: 'Hùng Kings' },
    { id: 'ly' as Dynasty, label: 'Lý' },
    { id: 'tran' as Dynasty, label: 'Trần' },
    { id: 'le' as Dynasty, label: 'Lê' },
    { id: 'nguyen' as Dynasty, label: 'Nguyễn' },
    { id: 'modern' as Dynasty, label: 'Modern' },
  ];

  const filteredQuests = selectedDynasty === 'all' 
    ? quests 
    : quests.filter(q => q.dynasty === selectedDynasty);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-amber-900/20 to-gray-900">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-600">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Book className="w-6 h-6" />
          Vietnamese History
        </h2>
        {progress && (
          <p className="text-amber-100 text-sm mt-1">
            {progress.totalCulturePoints} Culture Points • {progress.totalQuestsCompleted} Quests
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {[
          { id: 'quests' as TabType, label: 'Quests', icon: Book },
          { id: 'figures' as TabType, label: 'Figures', icon: Users },
          { id: 'badges' as TabType, label: 'Badges', icon: Award },
          { id: 'progress' as TabType, label: 'Progress', icon: Trophy },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap ${
              activeTab === tab.id ? 'bg-amber-500 text-white' : 'bg-gray-800/50 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'quests' && !selectedQuest && (
            <motion.div key="quests" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {dynasties.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDynasty(d.id)}
                    className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap text-sm ${
                      selectedDynasty === d.id ? 'bg-amber-500 text-white' : 'bg-gray-800/50 text-gray-400'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuests.map(quest => (
                  <div key={quest.id} className="bg-gray-800/50 rounded-lg p-4 border-2 border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{quest.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{quest.description}</p>
                      </div>
                      {quest.isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 rounded text-xs font-bold" 
                        style={{ backgroundColor: `${getDynastyColor(quest.dynasty)}30`, color: getDynastyColor(quest.dynasty) }}>
                        {quest.dynasty.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        quest.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        quest.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        quest.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {quest.difficulty.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-300">{quest.rewards.culturePoints} CP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-300">{quest.rewards.exp} EXP</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartQuest(quest)}
                      disabled={quest.isCompleted}
                      className={`w-full py-2 rounded-lg font-bold ${
                        quest.isCompleted
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600'
                      }`}
                    >
                      {quest.isCompleted ? 'Completed' : progress?.activeQuests?.has(quest.id) ? 'Continue' : 'Start Quest'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedQuest && (
            <motion.div key="quest-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={() => setSelectedQuest(null)}
                className="mb-4 text-amber-400 hover:text-amber-300"
              >
                ← Back to Quests
              </button>

              <div className="bg-gray-800/50 rounded-lg p-6 border-2" 
                style={{ borderColor: getDynastyColor(selectedQuest.dynasty) }}>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedQuest.title}</h2>
                <p className="text-gray-400 mb-4">{selectedQuest.description}</p>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Chapter {currentChapter + 1} of {selectedQuest.chapters.length}</span>
                    <span>{Math.round((currentChapter / selectedQuest.chapters.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${(currentChapter / selectedQuest.chapters.length) * 100}%` }} />
                  </div>
                </div>

                {selectedQuest.chapters[currentChapter] && (
                  <div className="bg-gray-900/50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {selectedQuest.chapters[currentChapter].title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-line">
                      {selectedQuest.chapters[currentChapter].content}
                    </p>

                    {selectedQuest.chapters[currentChapter].quiz ? (
                      <div className="space-y-3">
                        <p className="text-white font-bold">{selectedQuest.chapters[currentChapter].quiz.question}</p>
                        {selectedQuest.chapters[currentChapter].quiz.options?.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={handleCompleteChapter}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-bold hover:from-amber-600"
                      >
                        Continue <ChevronRight className="w-5 h-5 inline" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'figures' && (
            <motion.div key="figures" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {figures.map(fig => (
                  <div key={fig.id} className="bg-gray-800/50 rounded-lg p-4 border-2 border-gray-700">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{fig.name}</h3>
                        <p className="text-gray-400 text-sm">{fig.title}</p>
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold mt-1"
                          style={{ backgroundColor: `${getDynastyColor(fig.dynasty)}30`, color: getDynastyColor(fig.dynasty) }}>
                          {fig.dynasty.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-3">{fig.description}</p>
                    <div className="mt-3 p-3 bg-gray-900/50 rounded italic text-amber-400 text-sm">
                      "{fig.famousQuote}"
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-4">
                <h3 className="text-white font-bold">Unlocked: {unlockedBadges.length}/{badges.length}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map(badge => {
                  const unlocked = unlockedBadges.some(b => b.id === badge.id);
                  return (
                    <div key={badge.id} 
                      className={`bg-gray-800/50 rounded-lg p-4 border-2 ${unlocked ? 'border-amber-500' : 'border-gray-700'}`}>
                      <div className="text-4xl mb-2">{unlocked ? badge.icon : '🔒'}</div>
                      <h4 className={`font-bold ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                        {unlocked ? badge.name : '???'}
                      </h4>
                      <p className={`text-sm mt-1 ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                        {unlocked ? badge.description : 'Locked'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && progress && (
            <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Overall Progress</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-3xl font-bold text-amber-400">{progress.totalCulturePoints}</div>
                    <div className="text-gray-400 text-sm">Culture Points</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-3xl font-bold text-green-400">{progress.totalQuestsCompleted}</div>
                    <div className="text-gray-400 text-sm">Quests Done</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-3xl font-bold text-purple-400">{progress.perfectQuizzes}</div>
                    <div className="text-gray-400 text-sm">Perfect Quizzes</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-3xl font-bold text-blue-400">{unlockedBadges.length}</div>
                    <div className="text-gray-400 text-sm">Badges</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Dynasty Mastery</h3>
                <div className="space-y-3">
                  {(Array.from(progress.dynastyMastery.entries()) as [Dynasty, number][]).map(([dynasty, count]) => (
                    <div key={dynasty}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white capitalize">{dynasty.replace('_', ' ')}</span>
                        <span className="text-gray-400">{count} quests</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full">
                        <div className="h-full rounded-full" 
                          style={{ 
                            width: `${(count / 10) * 100}%`,
                            backgroundColor: getDynastyColor(dynasty)
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
