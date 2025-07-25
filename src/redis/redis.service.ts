/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Connected to Redis!');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis connection error:', err.message, err.stack);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Disconnected from Redis.');
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(
        `Failed to get key "${key}" from Redis: ${error.message}`,
      );
      return null;
    }
  }

  async set(
    key: string,
    value: string,
    mode?: 'EX' | 'PX' | 'KEEPTTL',
    duration?: number,
  ): Promise<string | null> {
    try {
      if (mode && duration !== undefined) {
        return await this.redisClient.set(key, value);
      }
      return await this.redisClient.set(key, value);
    } catch (error) {
      this.logger.error(
        `Failed to set key "${key}" in Redis: ${error.message}`,
      );
      return null;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(
        `Failed to delete key "${key}" from Redis: ${error.message}`,
      );
      return 0;
    }
  }
}
