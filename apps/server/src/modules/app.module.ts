import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { cacheConfig } from '@server/configs/cache.config'
import { ormBaseConfig } from '@server/configs/orm-migration.config'

import { ConfigController, HistoryController, StartController, TaskController } from '../controllers'
import { DatabaseService, TaskQueueService } from '../services'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      expandVariables: true,
    } as ConfigModuleOptions),

    TypeOrmModule.forRootAsync({
      useFactory: () => ormBaseConfig as any,
    }),

    CacheModule.registerAsync(cacheConfig),
  ],
  controllers: [HistoryController, TaskController, StartController, ConfigController],
  providers: [DatabaseService, TaskQueueService],
})
export class AppModule {}
