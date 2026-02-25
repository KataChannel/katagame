import { Injectable, OnModuleInit, OnModuleDestroy, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:11004';
    this.redis = new Redis(redisUrl);
    
    this.redis.on('connect', () => {
      console.log('🚀 Redis connected successfully!');
    });

    this.redis.on('error', (err) => {
      console.error('🔴 Redis connection error:', err);
    });
  }

  onModuleDestroy() {
    this.redis.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async reset(): Promise<void> {
    await this.redis.flushall();
  }
}
