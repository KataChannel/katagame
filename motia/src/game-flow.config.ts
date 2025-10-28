/**
 * Game Flow Configuration
 * Orchestrates all game events in a cohesive workflow
 */

// Initialize database on flow load
import './init-database'

export const gameFlowConfig = {
  id: 'game-flow',
  name: 'KataGame Main Flow',
  description: 'Core game loop: player actions → event processing → leaderboard updates',

  // All steps in the flow
  steps: [
    // Player lifecycle
    'PlayerLoginProcessor',

    // Core game systems
    'BattleResolutionProcessor',
    'QuestSubmissionProcessor',
    'MarketplaceTransactionProcessor',
    'GuildWarProcessor',
    'AchievementUnlockProcessor',

    // Periodic updates
    'LeaderboardUpdateCron',
    'AnalyticsAggregationCron',
  ],

  // Flow configuration
  config: {
    errorHandling: 'retry', // retry | skip | pause
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    timeout: 30000, // 30 seconds
    parallel: false, // Process events sequentially for consistency
  },

  // Event emitters
  events: {
    // Player events
    'player.login': {
      description: 'Player login event',
      handlers: ['PlayerLoginProcessor'],
    },
    'player.daily_reward_claimed': {
      description: 'Daily reward claimed',
      handlers: ['LeaderboardUpdateCron'],
    },
    'player.exp_gained': {
      description: 'Player gained experience',
      handlers: ['LeaderboardUpdateCron'],
    },
    'player.culture_earned': {
      description: 'Player earned culture points',
      handlers: [],
    },
    'player.gold_changed': {
      description: 'Player gold changed',
      handlers: [],
    },
    'player.item_received': {
      description: 'Player received item',
      handlers: [],
    },
    'player.points_earned': {
      description: 'Player earned achievement points',
      handlers: ['PlayerPointsEarnedSubscriber'],
    },

    // Battle events
    'battle.started': {
      description: 'Battle started',
      handlers: [],
    },
    'battle.completed': {
      description: 'Battle completed',
      handlers: ['BattleResolutionProcessor'],
    },

    // Quest events
    'quest.submitted': {
      description: 'Quest submitted',
      handlers: ['QuestSubmissionProcessor'],
    },

    // Marketplace events
    'marketplace.purchase': {
      description: 'Marketplace purchase',
      handlers: ['MarketplaceTransactionProcessor'],
    },

    // Guild events
    'guild.created': {
      description: 'Guild created',
      handlers: [],
    },
    'guild.war.declared': {
      description: 'Guild war declared',
      handlers: ['GuildWarProcessor'],
    },
    'guild.war_ended': {
      description: 'Guild war ended',
      handlers: [],
    },
    'guild.territory_captured': {
      description: 'Territory captured',
      handlers: [],
    },

    // Achievement events
    'achievement.check': {
      description: 'Check for achievement unlock',
      handlers: ['AchievementUnlockProcessor'],
    },
    'achievement.unlocked': {
      description: 'Achievement unlocked',
      handlers: [],
    },

    // Leaderboard events
    'leaderboard.update': {
      description: 'Leaderboard update needed',
      handlers: ['LeaderboardUpdateCron'],
    },
    'leaderboard.score_update': {
      description: 'Leaderboard score updated',
      handlers: [],
    },
    'leaderboard.updated': {
      description: 'Leaderboard fully updated',
      handlers: [],
    },

    // Season events
    'season.rewards_distributed': {
      description: 'Season rewards distributed',
      handlers: [],
    },

    // Analytics events
    'analytics.daily_report': {
      description: 'Daily analytics report',
      handlers: [],
    },
    'analytics.retention_calculated': {
      description: 'Retention metrics calculated',
      handlers: [],
    },
  },

  // Retry policies
  retryPolicy: {
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  },

  // Timeout policies
  timeoutPolicy: {
    stepTimeout: 30000,
    eventTimeout: 60000,
    maxConcurrency: 10,
  },

  // Monitoring
  monitoring: {
    logLevel: 'info',
    metricsEnabled: true,
    tracingEnabled: true,
    alertsEnabled: true,
  },
}

/**
 * Event emission templates for common game actions
 */
export const eventTemplates = {
  playerLogin: (playerId: string) => ({
    topic: 'player.login',
    data: {
      playerId,
      timestamp: Date.now(),
    },
  }),

  battleCompleted: (
    attackerId: string,
    defenderId: string,
    result: 'attacker_win' | 'defender_win' | 'draw'
  ) => ({
    topic: 'battle.completed',
    data: {
      attackerId,
      defenderId,
      result,
      timestamp: Date.now(),
    },
  }),

  questSubmitted: (playerId: string, questId: string, answers: number[]) => ({
    topic: 'quest.submitted',
    data: {
      playerId,
      questId,
      answers,
      timestamp: Date.now(),
    },
  }),

  marketplacePurchase: (
    buyerId: string,
    sellerId: string,
    listingId: string,
    price: number
  ) => ({
    topic: 'marketplace.purchase',
    data: {
      buyerId,
      sellerId,
      listingId,
      price,
      timestamp: Date.now(),
    },
  }),

  guildWarDeclared: (
    attackerGuildId: string,
    defenderGuildId: string,
    provinceId: string
  ) => ({
    topic: 'guild.war.declared',
    data: {
      attackerGuildId,
      defenderGuildId,
      provinceId,
      timestamp: Date.now(),
    },
  }),

  achievementCheck: (
    playerId: string,
    achievementType: string,
    value: number
  ) => ({
    topic: 'achievement.check',
    data: {
      playerId,
      achievementType,
      value,
      timestamp: Date.now(),
    },
  }),
}
