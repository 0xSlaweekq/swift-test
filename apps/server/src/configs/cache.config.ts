import { CacheModuleAsyncOptions, CacheOptions } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-store'

export const cacheConfig: CacheModuleAsyncOptions<CacheOptions> = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const host = configService.get<string>('REDIS_HOST', '0.0.0.0')
    const port = configService.get<number>('REDIS_PORT', 6379)
    const database = configService.get<number>('REDIS_DB', 0)
    const password = configService.get<string>('REDIS_PASSWORD')

    return {
      max: 100000, // maximum number of items in cache
      store: redisStore,
      host,
      port,
      database,
      password,
      isGlobal: true,
    }
  },
  inject: [ConfigService],
}
