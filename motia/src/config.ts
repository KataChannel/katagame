/**
 * Environment Configuration
 * Loads and validates all environment variables
 */

interface AppConfig {
  database: {
    url: string
    poolSize: number
    idleTimeout: number
    timeout: number
  }
  jwt: {
    secret: string
    expiry: string
  }
  redis: {
    url: string
    db: number
  }
  motia: {
    env: 'development' | 'production' | 'staging'
    logLevel: string
    maxRetries: number
    retryDelay: number
  }
  server: {
    nodeEnv: string
    port: number
    host: string
  }
  logging: {
    level: string
    format: 'json' | 'text'
  }
  features: {
    guildWars: boolean
    marketplace: boolean
    quests: boolean
    analytics: boolean
    achievements: boolean
  }
  rateLimit: {
    windowMs: number
    maxRequests: number
  }
  cors: {
    origin: string
    credentials: boolean
  }
  analytics: {
    enabled: boolean
    sampleRate: number
  }
  monitoring: {
    enabled: boolean
    metricsPort: number
  }
  featureFlags: {
    newBattleSystem: boolean
    pveDungeons: boolean
    realTimeLeaderboard: boolean
  }
}

class ConfigLoader {
  private config: AppConfig

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): AppConfig {
    return {
      database: {
        url:
          process.env.DATABASE_URL ||
          'postgresql://user:password@localhost:5432/katagame',
        poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20'),
        idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
        timeout: parseInt(process.env.DATABASE_TIMEOUT || '2000'),
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-prod',
        expiry: process.env.JWT_EXPIRY || '24h',
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        db: parseInt(process.env.REDIS_DB || '0'),
      },
      motia: {
        env: (process.env.MOTIA_ENV as any) || 'development',
        logLevel: process.env.MOTIA_LOG_LEVEL || 'debug',
        maxRetries: parseInt(process.env.MOTIA_MAX_RETRIES || '3'),
        retryDelay: parseInt(process.env.MOTIA_RETRY_DELAY || '5000'),
      },
      server: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '11001'),
        host: process.env.HOST || '0.0.0.0',
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: (process.env.LOG_FORMAT as any) || 'json',
      },
      features: {
        guildWars: process.env.ENABLE_GUILD_WARS !== 'false',
        marketplace: process.env.ENABLE_MARKETPLACE !== 'false',
        quests: process.env.ENABLE_QUESTS !== 'false',
        analytics: process.env.ENABLE_ANALYTICS !== 'false',
        achievements: process.env.ENABLE_ACHIEVEMENTS !== 'false',
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      },
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:11000',
        credentials: process.env.CORS_CREDENTIALS !== 'false',
      },
      analytics: {
        enabled: process.env.ANALYTICS_ENABLED !== 'false',
        sampleRate: parseFloat(process.env.ANALYTICS_SAMPLE_RATE || '1.0'),
      },
      monitoring: {
        enabled: process.env.MONITORING_ENABLED !== 'false',
        metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
      },
      featureFlags: {
        newBattleSystem: process.env.FEATURE_NEW_BATTLE_SYSTEM === 'true',
        pveDungeons: process.env.FEATURE_PVE_DUNGEONS === 'true',
        realTimeLeaderboard:
          process.env.FEATURE_REAL_TIME_LEADERBOARD === 'true',
      },
    }
  }

  getConfig(): AppConfig {
    return this.config
  }

  validate(): boolean {
    // Validate required config
    if (!this.config.database.url) {
      console.error('DATABASE_URL is required')
      return false
    }

    if (!this.config.jwt.secret) {
      console.warn('JWT_SECRET is using default value. Set in production!')
    }

    return true
  }

  print(): void {
    console.log('=== KataGame Configuration ===')
    console.log('Environment:', this.config.motia.env)
    console.log('Node Env:', this.config.server.nodeEnv)
    console.log('Server:', `${this.config.server.host}:${this.config.server.port}`)
    console.log('Database:', this.config.database.url.split('@')[1] || 'configured')
    console.log('Features:', {
      guildWars: this.config.features.guildWars,
      marketplace: this.config.features.marketplace,
      quests: this.config.features.quests,
      analytics: this.config.features.analytics,
      achievements: this.config.features.achievements,
    })
    console.log('================================')
  }
}

// Export singleton
let configLoader: ConfigLoader | null = null

export function initConfig(): AppConfig {
  if (!configLoader) {
    configLoader = new ConfigLoader()
    if (!configLoader.validate()) {
      throw new Error('Invalid configuration')
    }
    configLoader.print()
  }
  return configLoader.getConfig()
}

export function getConfig(): AppConfig {
  if (!configLoader) {
    throw new Error('Config not initialized. Call initConfig first.')
  }
  return configLoader.getConfig()
}
