// Advanced Analytics & Admin Dashboard System
// Player behavior, retention, monetization, and moderation tools

export type MetricType = 'dau' | 'mau' | 'retention' | 'revenue' | 'engagement';
export type RetentionDay = 1 | 7 | 30;
export type PlayerAction = 'login' | 'battle' | 'purchase' | 'trade' | 'quest' | 'social';
export type ModActionType = 'ban' | 'suspend' | 'warn' | 'mute' | 'unban';

export interface PlayerBehavior {
  playerId: string;
  sessionStart: number;
  sessionEnd?: number;
  sessionDuration: number;
  
  actionsPerformed: Map<PlayerAction, number>;
  featuresUsed: Set<string>;
  pagesVisited: string[];
  
  lastActive: number;
  totalSessions: number;
  avgSessionDuration: number;
}

export interface RetentionMetrics {
  cohortDate: number;
  totalPlayers: number;
  
  day1Retained: number;
  day7Retained: number;
  day30Retained: number;
  
  day1Rate: number;
  day7Rate: number;
  day30Rate: number;
}

export interface MonetizationMetrics {
  date: number;
  
  totalRevenue: number;
  totalPurchases: number;
  payingUsers: number;
  
  arpu: number; // Average Revenue Per User
  arppu: number; // Average Revenue Per Paying User
  conversionRate: number;
  
  revenueBySource: Map<string, number>;
  topSpenders: { playerId: string; amount: number }[];
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  
  variants: ABVariant[];
  startDate: number;
  endDate?: number;
  
  isActive: boolean;
  totalParticipants: number;
  
  winningVariant?: string;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  
  participants: Set<string>;
  conversions: number;
  revenue: number;
  
  conversionRate: number;
  avgRevenuePerUser: number;
}

export interface PlayerModeration {
  playerId: string;
  playerName: string;
  
  status: 'active' | 'warned' | 'muted' | 'suspended' | 'banned';
  
  warnings: ModAction[];
  suspensions: ModAction[];
  bans: ModAction[];
  
  chatLogs: ChatLog[];
  reportCount: number;
  
  totalSpent: number;
  accountAge: number;
}

export interface ModAction {
  id: string;
  type: ModActionType;
  playerId: string;
  adminId: string;
  
  reason: string;
  duration?: number;
  
  createdAt: number;
  expiresAt?: number;
  
  isActive: boolean;
}

export interface ChatLog {
  id: string;
  playerId: string;
  channel: string;
  message: string;
  timestamp: number;
  
  isFlagged: boolean;
  flagReason?: string;
}

export interface EconomyMetrics {
  date: number;
  
  totalGold: number;
  totalGems: number;
  
  goldGenerated: number;
  goldSpent: number;
  goldSinks: Map<string, number>;
  goldSources: Map<string, number>;
  
  gemsGenerated: number;
  gemsSpent: number;
  gemsSold: number;
  
  inflationRate: number;
  avgPlayerWealth: number;
}

const ANALYTICS_CONFIG = {
  SESSION_TIMEOUT: 1800000, // 30 minutes
  RETENTION_COHORTS: [1, 7, 30],
  TOP_SPENDERS_LIMIT: 100,
  CHAT_LOG_RETENTION: 2592000000, // 30 days
  
  REVENUE_SOURCES: [
    'gems',
    'battle_pass',
    'cosmetics',
    'boosters',
    'marketplace',
    'subscriptions',
  ],
  
  ECONOMY_SINKS: [
    'hero_upgrades',
    'equipment',
    'marketplace_fees',
    'guild_expenses',
    'consumables',
  ],
  
  ECONOMY_SOURCES: [
    'quest_rewards',
    'battle_rewards',
    'daily_login',
    'achievements',
    'events',
  ],
};

class AnalyticsSystem {
  private static instance: AnalyticsSystem;
  
  private playerBehaviors: Map<string, PlayerBehavior> = new Map();
  private retentionCohorts: Map<number, RetentionMetrics> = new Map();
  private monetization: Map<number, MonetizationMetrics> = new Map();
  private abTests: Map<string, ABTest> = new Map();
  private playerModerations: Map<string, PlayerModeration> = new Map();
  private economyMetrics: Map<number, EconomyMetrics> = new Map();
  private chatLogs: ChatLog[] = [];
  
  private constructor() {
    this.initializeMetrics();
    this.startBackgroundProcesses();
  }
  
  public static getInstance(): AnalyticsSystem {
    if (!AnalyticsSystem.instance) {
      AnalyticsSystem.instance = new AnalyticsSystem();
    }
    return AnalyticsSystem.instance;
  }
  
  private initializeMetrics(): void {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Initialize today's metrics
    this.monetization.set(today, {
      date: today,
      totalRevenue: 0,
      totalPurchases: 0,
      payingUsers: 0,
      arpu: 0,
      arppu: 0,
      conversionRate: 0,
      revenueBySource: new Map(),
      topSpenders: [],
    });
    
    this.economyMetrics.set(today, {
      date: today,
      totalGold: 0,
      totalGems: 0,
      goldGenerated: 0,
      goldSpent: 0,
      goldSinks: new Map(),
      goldSources: new Map(),
      gemsGenerated: 0,
      gemsSpent: 0,
      gemsSold: 0,
      inflationRate: 0,
      avgPlayerWealth: 0,
    });
  }
  
  // Player Behavior Tracking
  public trackPlayerSession(playerId: string): void {
    let behavior = this.playerBehaviors.get(playerId);
    
    if (!behavior) {
      behavior = {
        playerId,
        sessionStart: Date.now(),
        sessionDuration: 0,
        actionsPerformed: new Map(),
        featuresUsed: new Set(),
        pagesVisited: [],
        lastActive: Date.now(),
        totalSessions: 1,
        avgSessionDuration: 0,
      };
      this.playerBehaviors.set(playerId, behavior);
    } else {
      const timeSinceLastActive = Date.now() - behavior.lastActive;
      
      if (timeSinceLastActive > ANALYTICS_CONFIG.SESSION_TIMEOUT) {
        behavior.sessionEnd = behavior.lastActive;
        behavior.sessionDuration = behavior.sessionEnd - behavior.sessionStart;
        behavior.totalSessions++;
        behavior.sessionStart = Date.now();
      }
      
      behavior.lastActive = Date.now();
    }
  }
  
  public trackPlayerAction(playerId: string, action: PlayerAction, feature?: string): void {
    const behavior = this.playerBehaviors.get(playerId);
    if (!behavior) return;
    
    const count = behavior.actionsPerformed.get(action) || 0;
    behavior.actionsPerformed.set(action, count + 1);
    
    if (feature) {
      behavior.featuresUsed.add(feature);
    }
  }
  
  public trackPageVisit(playerId: string, page: string): void {
    const behavior = this.playerBehaviors.get(playerId);
    if (!behavior) return;
    
    behavior.pagesVisited.push(page);
  }
  
  public getPlayerBehavior(playerId: string): PlayerBehavior | undefined {
    return this.playerBehaviors.get(playerId);
  }
  
  // Retention Metrics
  public initializeCohort(date: number, playerCount: number): void {
    this.retentionCohorts.set(date, {
      cohortDate: date,
      totalPlayers: playerCount,
      day1Retained: 0,
      day7Retained: 0,
      day30Retained: 0,
      day1Rate: 0,
      day7Rate: 0,
      day30Rate: 0,
    });
  }
  
  public updateRetention(cohortDate: number, playerId: string, lastLoginDate: number): void {
    const cohort = this.retentionCohorts.get(cohortDate);
    if (!cohort) return;
    
    const daysSinceJoin = Math.floor((lastLoginDate - cohortDate) / 86400000);
    
    if (daysSinceJoin >= 1) cohort.day1Retained++;
    if (daysSinceJoin >= 7) cohort.day7Retained++;
    if (daysSinceJoin >= 30) cohort.day30Retained++;
    
    cohort.day1Rate = (cohort.day1Retained / cohort.totalPlayers) * 100;
    cohort.day7Rate = (cohort.day7Retained / cohort.totalPlayers) * 100;
    cohort.day30Rate = (cohort.day30Retained / cohort.totalPlayers) * 100;
  }
  
  public getRetentionMetrics(date: number): RetentionMetrics | undefined {
    return this.retentionCohorts.get(date);
  }
  
  public getAllRetentionMetrics(): RetentionMetrics[] {
    return Array.from(this.retentionCohorts.values());
  }
  
  // Monetization Tracking
  public trackPurchase(playerId: string, amount: number, source: string): void {
    const today = new Date().setHours(0, 0, 0, 0);
    let metrics = this.monetization.get(today);
    
    if (!metrics) {
      this.initializeMetrics();
      metrics = this.monetization.get(today)!;
    }
    
    metrics.totalRevenue += amount;
    metrics.totalPurchases++;
    
    const sourceRevenue = metrics.revenueBySource.get(source) || 0;
    metrics.revenueBySource.set(source, sourceRevenue + amount);
    
    const spenderIndex = metrics.topSpenders.findIndex(s => s.playerId === playerId);
    if (spenderIndex >= 0) {
      metrics.topSpenders[spenderIndex].amount += amount;
    } else {
      metrics.topSpenders.push({ playerId, amount });
    }
    
    metrics.topSpenders.sort((a, b) => b.amount - a.amount);
    metrics.topSpenders = metrics.topSpenders.slice(0, ANALYTICS_CONFIG.TOP_SPENDERS_LIMIT);
    
    this.calculateMonetizationMetrics(today);
  }
  
  private calculateMonetizationMetrics(date: number): void {
    const metrics = this.monetization.get(date);
    if (!metrics) return;
    
    const totalPlayers = this.playerBehaviors.size;
    const payingUsers = new Set(metrics.topSpenders.map(s => s.playerId)).size;
    
    metrics.payingUsers = payingUsers;
    metrics.arpu = totalPlayers > 0 ? metrics.totalRevenue / totalPlayers : 0;
    metrics.arppu = payingUsers > 0 ? metrics.totalRevenue / payingUsers : 0;
    metrics.conversionRate = totalPlayers > 0 ? (payingUsers / totalPlayers) * 100 : 0;
  }
  
  public getMonetizationMetrics(date: number): MonetizationMetrics | undefined {
    return this.monetization.get(date);
  }
  
  // A/B Testing
  public createABTest(name: string, description: string, variants: { name: string; description: string }[]): ABTest {
    const test: ABTest = {
      id: `ab_${Date.now()}`,
      name,
      description,
      variants: variants.map(v => ({
        id: `variant_${Date.now()}_${v.name}`,
        name: v.name,
        description: v.description,
        participants: new Set(),
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        avgRevenuePerUser: 0,
      })),
      startDate: Date.now(),
      isActive: true,
      totalParticipants: 0,
    };
    
    this.abTests.set(test.id, test);
    return test;
  }
  
  public assignPlayerToVariant(testId: string, playerId: string): ABVariant | null {
    const test = this.abTests.get(testId);
    if (!test || !test.isActive) return null;
    
    const variantIndex = Math.floor(Math.random() * test.variants.length);
    const variant = test.variants[variantIndex];
    
    variant.participants.add(playerId);
    test.totalParticipants++;
    
    return variant;
  }
  
  public trackABConversion(testId: string, variantId: string, revenue: number = 0): void {
    const test = this.abTests.get(testId);
    if (!test) return;
    
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return;
    
    variant.conversions++;
    variant.revenue += revenue;
    variant.conversionRate = (variant.conversions / variant.participants.size) * 100;
    variant.avgRevenuePerUser = variant.revenue / variant.participants.size;
  }
  
  public getABTest(testId: string): ABTest | undefined {
    return this.abTests.get(testId);
  }
  
  public getAllABTests(): ABTest[] {
    return Array.from(this.abTests.values());
  }
  
  // Player Moderation
  public initializePlayerModeration(playerId: string, playerName: string): void {
    this.playerModerations.set(playerId, {
      playerId,
      playerName,
      status: 'active',
      warnings: [],
      suspensions: [],
      bans: [],
      chatLogs: [],
      reportCount: 0,
      totalSpent: 0,
      accountAge: Date.now(),
    });
  }
  
  public createModAction(
    playerId: string,
    adminId: string,
    type: ModActionType,
    reason: string,
    duration?: number
  ): ModAction {
    const action: ModAction = {
      id: `mod_${Date.now()}`,
      type,
      playerId,
      adminId,
      reason,
      duration,
      createdAt: Date.now(),
      expiresAt: duration ? Date.now() + duration : undefined,
      isActive: true,
    };
    
    const moderation = this.playerModerations.get(playerId);
    if (moderation) {
      if (type === 'ban') {
        moderation.bans.push(action);
        moderation.status = 'banned';
      } else if (type === 'suspend') {
        moderation.suspensions.push(action);
        moderation.status = 'suspended';
      } else if (type === 'warn') {
        moderation.warnings.push(action);
        moderation.status = 'warned';
      } else if (type === 'mute') {
        moderation.status = 'muted';
      } else if (type === 'unban') {
        moderation.status = 'active';
      }
    }
    
    return action;
  }
  
  public getPlayerModeration(playerId: string): PlayerModeration | undefined {
    return this.playerModerations.get(playerId);
  }
  
  public searchPlayers(query: string): PlayerModeration[] {
    return Array.from(this.playerModerations.values()).filter(m =>
      m.playerName.toLowerCase().includes(query.toLowerCase()) ||
      m.playerId.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  // Chat Logging
  public logChat(playerId: string, channel: string, message: string): void {
    const log: ChatLog = {
      id: `chat_${Date.now()}`,
      playerId,
      channel,
      message,
      timestamp: Date.now(),
      isFlagged: false,
    };
    
    this.chatLogs.push(log);
    
    const moderation = this.playerModerations.get(playerId);
    if (moderation) {
      moderation.chatLogs.push(log);
    }
    
    this.cleanupOldChatLogs();
  }
  
  public flagChat(chatId: string, reason: string): void {
    const log = this.chatLogs.find(l => l.id === chatId);
    if (log) {
      log.isFlagged = true;
      log.flagReason = reason;
    }
  }
  
  public getChatLogs(playerId: string, limit: number = 100): ChatLog[] {
    return this.chatLogs
      .filter(l => l.playerId === playerId)
      .slice(-limit);
  }
  
  private cleanupOldChatLogs(): void {
    const cutoff = Date.now() - ANALYTICS_CONFIG.CHAT_LOG_RETENTION;
    this.chatLogs = this.chatLogs.filter(l => l.timestamp > cutoff);
  }
  
  // Economy Monitoring
  public trackEconomyTransaction(
    type: 'gold' | 'gems',
    amount: number,
    category: 'sink' | 'source',
    subcategory: string
  ): void {
    const today = new Date().setHours(0, 0, 0, 0);
    let metrics = this.economyMetrics.get(today);
    
    if (!metrics) {
      this.initializeMetrics();
      metrics = this.economyMetrics.get(today)!;
    }
    
    if (type === 'gold') {
      if (category === 'sink') {
        metrics.goldSpent += amount;
        const current = metrics.goldSinks.get(subcategory) || 0;
        metrics.goldSinks.set(subcategory, current + amount);
      } else {
        metrics.goldGenerated += amount;
        const current = metrics.goldSources.get(subcategory) || 0;
        metrics.goldSources.set(subcategory, current + amount);
      }
    } else {
      if (category === 'sink') {
        metrics.gemsSpent += amount;
      } else {
        metrics.gemsGenerated += amount;
      }
    }
  }
  
  public getEconomyMetrics(date: number): EconomyMetrics | undefined {
    return this.economyMetrics.get(date);
  }
  
  // Analytics Queries
  public getDAU(): number {
    const today = new Date().setHours(0, 0, 0, 0);
    let count = 0;
    
    this.playerBehaviors.forEach(behavior => {
      if (behavior.lastActive >= today) {
        count++;
      }
    });
    
    return count;
  }
  
  public getMAU(): number {
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    let count = 0;
    
    this.playerBehaviors.forEach(behavior => {
      if (behavior.lastActive >= thirtyDaysAgo) {
        count++;
      }
    });
    
    return count;
  }
  
  public getEngagementMetrics(): {
    avgSessionDuration: number;
    avgSessionsPerUser: number;
    mostUsedFeatures: { feature: string; count: number }[];
  } {
    let totalDuration = 0;
    let totalSessions = 0;
    const featureUsage = new Map<string, number>();
    
    this.playerBehaviors.forEach(behavior => {
      totalDuration += behavior.avgSessionDuration;
      totalSessions += behavior.totalSessions;
      
      behavior.featuresUsed.forEach(feature => {
        const count = featureUsage.get(feature) || 0;
        featureUsage.set(feature, count + 1);
      });
    });
    
    const playerCount = this.playerBehaviors.size;
    
    const mostUsedFeatures = Array.from(featureUsage.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      avgSessionDuration: playerCount > 0 ? totalDuration / playerCount : 0,
      avgSessionsPerUser: playerCount > 0 ? totalSessions / playerCount : 0,
      mostUsedFeatures,
    };
  }
  
  private startBackgroundProcesses(): void {
    setInterval(() => {
      this.playerBehaviors.forEach(behavior => {
        const timeSinceLastActive = Date.now() - behavior.lastActive;
        
        if (timeSinceLastActive > ANALYTICS_CONFIG.SESSION_TIMEOUT && !behavior.sessionEnd) {
          behavior.sessionEnd = behavior.lastActive;
          behavior.sessionDuration = behavior.sessionEnd - behavior.sessionStart;
          
          const totalDuration = behavior.avgSessionDuration * (behavior.totalSessions - 1) + behavior.sessionDuration;
          behavior.avgSessionDuration = totalDuration / behavior.totalSessions;
        }
      });
      
      this.abTests.forEach(test => {
        if (test.isActive && test.endDate && Date.now() > test.endDate) {
          test.isActive = false;
          
          const bestVariant = test.variants.reduce((best, current) =>
            current.conversionRate > best.conversionRate ? current : best
          );
          test.winningVariant = bestVariant.id;
        }
      });
      
      this.playerModerations.forEach(mod => {
        [...mod.bans, ...mod.suspensions].forEach(action => {
          if (action.isActive && action.expiresAt && Date.now() > action.expiresAt) {
            action.isActive = false;
            mod.status = 'active';
          }
        });
      });
    }, 60000); // 1 minute
  }
}

let analyticsSystemInstance: AnalyticsSystem | null = null;

export function getAnalyticsSystem(): AnalyticsSystem {
  if (!analyticsSystemInstance) {
    analyticsSystemInstance = AnalyticsSystem.getInstance();
  }
  return analyticsSystemInstance;
}
