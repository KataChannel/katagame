// Educational Quest System - Vietnamese History & Culture
// Interactive storytelling with quizzes and historical figures

export type QuestType = 'story' | 'quiz' | 'exploration' | 'battle' | 'puzzle';
export type QuizType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
export type Dynasty = 'hung_kings' | 'ly' | 'tran' | 'le' | 'nguyen' | 'modern';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface EducationalQuest {
  id: string;
  title: string;
  description: string;
  dynasty: Dynasty;
  type: QuestType;
  difficulty: Difficulty;
  
  // Story content
  story: string;
  chapters: QuestChapter[];
  
  // Requirements
  requiredLevel: number;
  prerequisiteQuests: string[];
  
  // Rewards
  rewards: {
    exp: number;
    gold: number;
    culturePoints: number;
    badgeId?: string;
    titleId?: string;
    heroId?: string;
  };
  
  // Progress
  isUnlocked: boolean;
  isCompleted: boolean;
  completionRate: number;
  
  // Meta
  historicalFacts: string[];
  learnedFacts: Set<string>;
  totalPlayers: number;
  completionCount: number;
}

export interface QuestChapter {
  id: string;
  title: string;
  content: string;
  
  // Choices
  choices?: QuestChoice[];
  
  // Quiz
  quiz?: Quiz;
  
  // NPCs
  npc?: HistoricalFigure;
  
  isCompleted: boolean;
  selectedChoice?: string;
}

export interface QuestChoice {
  id: string;
  text: string;
  consequence: string;
  nextChapterId?: string;
  
  // Impact
  culturePointsGain: number;
  relationshipChange?: { npcId: string; change: number };
  
  // Requirements
  requiresItem?: string;
  requiresCulturePoints?: number;
}

export interface Quiz {
  id: string;
  type: QuizType;
  question: string;
  
  // Multiple choice / True-False
  options?: string[];
  correctAnswer: string | number;
  
  // Fill in blank
  blanks?: string[];
  
  // Matching
  pairs?: { left: string; right: string }[];
  
  explanation: string;
  difficultyMultiplier: number;
  
  attempts: number;
  maxAttempts: number;
  isCorrect: boolean;
}

export interface HistoricalFigure {
  id: string;
  name: string;
  title: string;
  dynasty: Dynasty;
  description: string;
  
  // Bio
  birthYear?: number;
  deathYear?: number;
  achievements: string[];
  famousQuote: string;
  
  // Game stats
  relationship: number; // -100 to 100
  questsGiven: string[];
  
  // Visuals
  avatarUrl?: string;
  iconUrl?: string;
}

export interface CulturalBadge {
  id: string;
  name: string;
  description: string;
  dynasty: Dynasty;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  unlockCondition: {
    type: 'quests_completed' | 'culture_points' | 'dynasty_mastery' | 'quiz_perfect' | 'special';
    value: number | string;
  };
  
  isUnlocked: boolean;
  unlockedAt?: number;
  totalOwners: number;
}

export interface PlayerEducationProgress {
  playerId: string;
  
  // Points
  totalCulturePoints: number;
  culturePointsByDynasty: Map<Dynasty, number>;
  
  // Quests
  completedQuests: Set<string>;
  activeQuests: Set<string>;
  questProgress: Map<string, number>;
  
  // Knowledge
  learnedFacts: Set<string>;
  quizScores: Map<string, number>;
  perfectQuizzes: number;
  
  // Badges
  unlockedBadges: Set<string>;
  
  // NPCs
  npcRelationships: Map<string, number>;
  
  // Stats
  totalQuestsCompleted: number;
  dynastyMastery: Map<Dynasty, number>;
  
  lastUpdated: number;
}

const EDUCATIONAL_CONFIG = {
  DYNASTIES: {
    hung_kings: { name: 'Hùng Kings', period: '2879 BC - 258 BC', color: '#8B4513' },
    ly: { name: 'Lý Dynasty', period: '1009 - 1225', color: '#FFD700' },
    tran: { name: 'Trần Dynasty', period: '1225 - 1400', color: '#4169E1' },
    le: { name: 'Lê Dynasty', period: '1428 - 1789', color: '#DC143C' },
    nguyen: { name: 'Nguyễn Dynasty', period: '1802 - 1945', color: '#9370DB' },
    modern: { name: 'Modern Vietnam', period: '1945 - Present', color: '#FF4500' },
  },
  
  CULTURE_POINTS: {
    easy: 50,
    medium: 100,
    hard: 200,
    expert: 400,
  },
  
  QUIZ_REWARDS: {
    perfect: 2.0,
    good: 1.5,
    pass: 1.0,
  },
  
  MASTERY_LEVELS: [10, 25, 50, 100, 200],
};

class EducationalSystem {
  private static instance: EducationalSystem;
  
  private quests: Map<string, EducationalQuest> = new Map();
  private figures: Map<string, HistoricalFigure> = new Map();
  private badges: Map<string, CulturalBadge> = new Map();
  private playerProgress: Map<string, PlayerEducationProgress> = new Map();
  
  private constructor() {
    this.initializeHistoricalFigures();
    this.initializeQuests();
    this.initializeBadges();
  }
  
  public static getInstance(): EducationalSystem {
    if (!EducationalSystem.instance) {
      EducationalSystem.instance = new EducationalSystem();
    }
    return EducationalSystem.instance;
  }
  
  private initializeHistoricalFigures(): void {
    // Hùng Kings Era
    this.addFigure('hung_vuong', 'Hùng Vương', 'Founding King', 'hung_kings',
      'Legendary founder of Vietnam, established Văn Lang kingdom',
      -2879, -258,
      ['Founded Văn Lang', 'United Vietnamese tribes', 'Established rice cultivation'],
      'Brothers are like arms and legs, anyone else is just a stranger');
    
    // Lý Dynasty
    this.addFigure('ly_thai_to', 'Lý Thái Tổ', 'Emperor', 'ly',
      'Founded Lý Dynasty, moved capital to Thăng Long (Hanoi)',
      974, 1028,
      ['Founded Lý Dynasty', 'Built Thăng Long Citadel', 'Promoted Buddhism'],
      'A nation needs to be governed with virtue and compassion');
    
    // Trần Dynasty
    this.addFigure('tran_hung_dao', 'Trần Hưng Đạo', 'Grand Commander', 'tran',
      'Military genius who defeated Mongol invasions three times',
      1228, 1300,
      ['Defeated Mongols 1285', 'Defeated Mongols 1287', 'Bach Dang River victory'],
      'Better to die than to surrender and live in humiliation');
    
    this.addFigure('hai_ba_trung', 'Hai Bà Trưng', 'Warrior Queens', 'hung_kings',
      'Two sisters who led rebellion against Chinese rule',
      12, 43,
      ['Led rebellion 40 AD', 'Freed 65 citadels', 'Became queens of Vietnam'],
      'Rather die in dignity than live in submission');
    
    // Lê Dynasty
    this.addFigure('le_loi', 'Lê Lợi', 'Emperor', 'le',
      'Led uprising against Ming occupation, founded Lê Dynasty',
      1385, 1433,
      ['Led Lam Sơn uprising', 'Defeated Ming Dynasty', 'Founded Later Lê Dynasty'],
      'Victory comes from the people, not from weapons');
    
    // Nguyễn Dynasty
    this.addFigure('nguyen_hue', 'Nguyễn Huệ (Quang Trung)', 'Emperor', 'nguyen',
      'Led Tây Sơn rebellion, defeated Chinese Qing invasion',
      1753, 1792,
      ['Led Tây Sơn rebellion', 'Defeated Qing army 1789', 'Unified Vietnam'],
      'Attack when unexpected, win when unprepared');
    
    // Modern Era
    this.addFigure('ho_chi_minh', 'Hồ Chí Minh', 'President', 'modern',
      'Revolutionary leader, founded Democratic Republic of Vietnam',
      1890, 1969,
      ['Founded Communist Party', 'Declared independence 1945', 'Led resistance wars'],
      'Nothing is more precious than independence and freedom');
  }
  
  private addFigure(
    id: string, name: string, title: string, dynasty: Dynasty,
    description: string, birth: number, death: number,
    achievements: string[], quote: string
  ): void {
    this.figures.set(id, {
      id, name, title, dynasty, description,
      birthYear: birth,
      deathYear: death,
      achievements,
      famousQuote: quote,
      relationship: 0,
      questsGiven: [],
    });
  }
  
  private initializeQuests(): void {
    // Hùng Kings Quests
    this.createQuest('quest_hung_1', 'Legend of Âu Cơ and Lạc Long Quân', 'hung_kings', 'story', 'easy',
      'Learn about the legendary origins of the Vietnamese people',
      [
        { title: 'The Meeting', content: 'Âu Cơ, a fairy from the mountains, met Lạc Long Quân, dragon lord of the seas...' },
        { title: 'The Hundred Eggs', content: 'From their union came a sack containing 100 eggs, which hatched into 100 sons...' },
        { title: 'The Separation', content: 'They decided to separate - 50 sons followed mother to mountains, 50 followed father to sea...' },
      ],
      ['Vietnamese origin myth', 'Âu Cơ and Lạc Long Quân', 'Foundation of Văn Lang']);
    
    this.createQuest('quest_hung_2', 'The Rice Cake Story', 'hung_kings', 'quiz', 'easy',
      'Test your knowledge about Bánh Chưng and Bánh Dày',
      [
        { title: 'Quiz', content: 'Answer questions about this important Vietnamese tradition' },
      ],
      ['Bánh Chưng symbolism', 'Tết traditions', 'Prince Lang Liêu']);
    
    // Trần Dynasty Quests
    this.createQuest('quest_tran_1', 'The Mongol Invasions', 'tran', 'story', 'hard',
      'Experience the epic battles against Mongol forces',
      [
        { title: 'First Invasion 1258', content: 'Kublai Khan sent 300,000 troops to conquer Đại Việt...' },
        { title: 'Second Invasion 1285', content: 'The Mongols returned with even greater force...' },
        { title: 'Bach Dang Victory 1288', content: 'Trần Hưng Đạo planted iron-tipped stakes in Bach Dang River...' },
      ],
      ['Mongol invasions', 'Trần Hưng Đạo tactics', 'Bach Dang battle']);
    
    // Lê Dynasty Quests
    this.createQuest('quest_le_1', 'Lam Sơn Uprising', 'le', 'story', 'medium',
      'Join Lê Lợi in the fight for independence from Ming China',
      [
        { title: 'The Beginning', content: 'In 1418, Lê Lợi raised the banner of resistance in Lam Sơn...' },
        { title: 'Guerrilla Warfare', content: 'Using hit-and-run tactics, the rebels slowly gained strength...' },
        { title: 'Victory at Tốt Động', content: 'The decisive battle that drove out the Ming invaders...' },
      ],
      ['Lam Sơn uprising', 'Lê Lợi leadership', 'Ming occupation']);
    
    // Modern Quests
    this.createQuest('quest_modern_1', 'Declaration of Independence', 'modern', 'story', 'medium',
      'Witness the birth of modern Vietnam on September 2, 1945',
      [
        { title: 'Ba Đình Square', content: 'Half a million people gathered to hear Hồ Chí Minh...' },
        { title: 'The Declaration', content: '"All men are created equal. They are endowed by their Creator..."' },
        { title: 'Independence', content: 'After 80 years of French colonialism, Vietnam was finally free...' },
      ],
      ['August Revolution', 'Independence declaration', 'Hồ Chí Minh']);
  }
  
  private createQuest(
    id: string, title: string, dynasty: Dynasty, type: QuestType, difficulty: Difficulty,
    description: string, chapterData: { title: string; content: string }[],
    facts: string[]
  ): void {
    const chapters: QuestChapter[] = chapterData.map((ch, idx) => ({
      id: `${id}_ch${idx}`,
      title: ch.title,
      content: ch.content,
      isCompleted: false,
    }));
    
    if (type === 'quiz') {
      chapters[0].quiz = this.createQuiz(id, difficulty);
    }
    
    this.quests.set(id, {
      id, title, description, dynasty, type, difficulty,
      story: description,
      chapters,
      requiredLevel: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 5 : difficulty === 'hard' ? 10 : 15,
      prerequisiteQuests: [],
      rewards: {
        exp: EDUCATIONAL_CONFIG.CULTURE_POINTS[difficulty] * 10,
        gold: EDUCATIONAL_CONFIG.CULTURE_POINTS[difficulty] * 5,
        culturePoints: EDUCATIONAL_CONFIG.CULTURE_POINTS[difficulty],
      },
      isUnlocked: true,
      isCompleted: false,
      completionRate: 0,
      historicalFacts: facts,
      learnedFacts: new Set(),
      totalPlayers: 0,
      completionCount: 0,
    });
  }
  
  private createQuiz(questId: string, difficulty: Difficulty): Quiz {
    const quizzes = {
      quest_hung_2: {
        question: 'What do Bánh Chưng and Bánh Dày represent in Vietnamese culture?',
        options: [
          'Heaven and Earth',
          'Sun and Moon',
          'Fire and Water',
          'Day and Night',
        ],
        correctAnswer: 0,
        explanation: 'Bánh Chưng (square) represents Earth, Bánh Dày (round) represents Heaven, symbolizing the harmony of the universe.',
      },
    };
    
    const quizData = quizzes[questId as keyof typeof quizzes] || {
      question: 'Test question',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      explanation: 'Explanation',
    };
    
    return {
      id: `${questId}_quiz`,
      type: 'multiple_choice',
      ...quizData,
      difficultyMultiplier: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : difficulty === 'hard' ? 2 : 3,
      attempts: 0,
      maxAttempts: 3,
      isCorrect: false,
    };
  }
  
  private initializeBadges(): void {
    const dynasties: Dynasty[] = ['hung_kings', 'ly', 'tran', 'le', 'nguyen', 'modern'];
    
    dynasties.forEach(dynasty => {
      this.badges.set(`badge_${dynasty}_scholar`, {
        id: `badge_${dynasty}_scholar`,
        name: `${EDUCATIONAL_CONFIG.DYNASTIES[dynasty].name} Scholar`,
        description: `Complete all quests from ${EDUCATIONAL_CONFIG.DYNASTIES[dynasty].name}`,
        dynasty,
        icon: '📚',
        rarity: 'rare',
        unlockCondition: { type: 'dynasty_mastery', value: dynasty },
        isUnlocked: false,
        totalOwners: 0,
      });
    });
    
    this.badges.set('badge_historian', {
      id: 'badge_historian',
      name: 'Master Historian',
      description: 'Complete all educational quests',
      dynasty: 'modern',
      icon: '🏛️',
      rarity: 'legendary',
      unlockCondition: { type: 'quests_completed', value: 50 },
      isUnlocked: false,
      totalOwners: 0,
    });
    
    this.badges.set('badge_quiz_master', {
      id: 'badge_quiz_master',
      name: 'Quiz Master',
      description: 'Get perfect scores on 25 quizzes',
      dynasty: 'modern',
      icon: '🎓',
      rarity: 'epic',
      unlockCondition: { type: 'quiz_perfect', value: 25 },
      isUnlocked: false,
      totalOwners: 0,
    });
  }
  
  public initializePlayerProgress(playerId: string): PlayerEducationProgress {
    const progress: PlayerEducationProgress = {
      playerId,
      totalCulturePoints: 0,
      culturePointsByDynasty: new Map(),
      completedQuests: new Set(),
      activeQuests: new Set(),
      questProgress: new Map(),
      learnedFacts: new Set(),
      quizScores: new Map(),
      perfectQuizzes: 0,
      unlockedBadges: new Set(),
      npcRelationships: new Map(),
      totalQuestsCompleted: 0,
      dynastyMastery: new Map(),
      lastUpdated: Date.now(),
    };
    
    this.playerProgress.set(playerId, progress);
    return progress;
  }
  
  public getPlayerProgress(playerId: string): PlayerEducationProgress | undefined {
    return this.playerProgress.get(playerId);
  }
  
  public startQuest(playerId: string, questId: string): boolean {
    const progress = this.playerProgress.get(playerId);
    const quest = this.quests.get(questId);
    if (!progress || !quest) return false;
    
    progress.activeQuests.add(questId);
    progress.questProgress.set(questId, 0);
    quest.totalPlayers++;
    
    return true;
  }
  
  public completeChapter(playerId: string, questId: string, chapterIdx: number, choiceId?: string): any {
    const progress = this.playerProgress.get(playerId);
    const quest = this.quests.get(questId);
    if (!progress || !quest) return null;
    
    const chapter = quest.chapters[chapterIdx];
    if (!chapter || chapter.isCompleted) return null;
    
    chapter.isCompleted = true;
    if (choiceId) {
      chapter.selectedChoice = choiceId;
    }
    
    const completedChapters = quest.chapters.filter(ch => ch.isCompleted).length;
    const progressPercent = (completedChapters / quest.chapters.length) * 100;
    progress.questProgress.set(questId, progressPercent);
    
    quest.historicalFacts.forEach(fact => progress.learnedFacts.add(fact));
    
    if (completedChapters === quest.chapters.length) {
      return this.completeQuest(playerId, questId);
    }
    
    return { chapterComplete: true, nextChapter: chapterIdx + 1 };
  }
  
  public completeQuest(playerId: string, questId: string): any {
    const progress = this.playerProgress.get(playerId);
    const quest = this.quests.get(questId);
    if (!progress || !quest) return null;
    
    quest.isCompleted = true;
    quest.completionCount++;
    progress.completedQuests.add(questId);
    progress.activeQuests.delete(questId);
    progress.totalQuestsCompleted++;
    
    progress.totalCulturePoints += quest.rewards.culturePoints;
    const dynastyPoints = progress.culturePointsByDynasty.get(quest.dynasty) || 0;
    progress.culturePointsByDynasty.set(quest.dynasty, dynastyPoints + quest.rewards.culturePoints);
    
    const mastery = progress.dynastyMastery.get(quest.dynasty) || 0;
    progress.dynastyMastery.set(quest.dynasty, mastery + 1);
    
    this.checkBadgeUnlocks(playerId);
    
    progress.lastUpdated = Date.now();
    return quest.rewards;
  }
  
  public submitQuizAnswer(playerId: string, questId: string, quizId: string, answer: string | number): any {
    const progress = this.playerProgress.get(playerId);
    const quest = this.quests.get(questId);
    if (!progress || !quest) return null;
    
    const chapter = quest.chapters.find(ch => ch.quiz?.id === quizId);
    const quiz = chapter?.quiz;
    if (!quiz) return null;
    
    quiz.attempts++;
    const isCorrect = quiz.correctAnswer === answer;
    quiz.isCorrect = isCorrect;
    
    if (isCorrect) {
      const score = quiz.attempts === 1 ? 100 : quiz.attempts === 2 ? 75 : 50;
      progress.quizScores.set(quizId, score);
      
      if (score === 100) {
        progress.perfectQuizzes++;
      }
      
      chapter.isCompleted = true;
      return {
        correct: true,
        score,
        explanation: quiz.explanation,
        culturePoints: quest.rewards.culturePoints * (score / 100),
      };
    }
    
    return {
      correct: false,
      attemptsLeft: quiz.maxAttempts - quiz.attempts,
      explanation: quiz.attempts >= quiz.maxAttempts ? quiz.explanation : undefined,
    };
  }
  
  private checkBadgeUnlocks(playerId: string): void {
    const progress = this.playerProgress.get(playerId);
    if (!progress) return;
    
    this.badges.forEach(badge => {
      if (badge.isUnlocked || progress.unlockedBadges.has(badge.id)) return;
      
      let unlock = false;
      
      if (badge.unlockCondition.type === 'quests_completed') {
        unlock = progress.totalQuestsCompleted >= (badge.unlockCondition.value as number);
      } else if (badge.unlockCondition.type === 'quiz_perfect') {
        unlock = progress.perfectQuizzes >= (badge.unlockCondition.value as number);
      } else if (badge.unlockCondition.type === 'dynasty_mastery') {
        const dynasty = badge.unlockCondition.value as Dynasty;
        const dynastyQuests = Array.from(this.quests.values()).filter(q => q.dynasty === dynasty);
        const completed = dynastyQuests.filter(q => progress.completedQuests.has(q.id)).length;
        unlock = completed === dynastyQuests.length;
      }
      
      if (unlock) {
        badge.isUnlocked = true;
        badge.unlockedAt = Date.now();
        badge.totalOwners++;
        progress.unlockedBadges.add(badge.id);
      }
    });
  }
  
  public getAllQuests(): EducationalQuest[] {
    return Array.from(this.quests.values());
  }
  
  public getQuestsByDynasty(dynasty: Dynasty): EducationalQuest[] {
    return Array.from(this.quests.values()).filter(q => q.dynasty === dynasty);
  }
  
  public getAllFigures(): HistoricalFigure[] {
    return Array.from(this.figures.values());
  }
  
  public getFigure(id: string): HistoricalFigure | undefined {
    return this.figures.get(id);
  }
  
  public getAllBadges(): CulturalBadge[] {
    return Array.from(this.badges.values());
  }
  
  public getUnlockedBadges(playerId: string): CulturalBadge[] {
    const progress = this.playerProgress.get(playerId);
    if (!progress) return [];
    
    return Array.from(progress.unlockedBadges)
      .map(id => this.badges.get(id))
      .filter((b): b is CulturalBadge => b !== undefined);
  }
}

let educationalSystemInstance: EducationalSystem | null = null;

export function getEducationalSystem(): EducationalSystem {
  if (!educationalSystemInstance) {
    educationalSystemInstance = EducationalSystem.getInstance();
  }
  return educationalSystemInstance;
}
