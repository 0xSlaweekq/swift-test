import * as fs from 'fs'
import * as path from 'path'

import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Controller, Get, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Controller('config')
export class ConfigController {
  constructor(@Inject(CACHE_MANAGER) private _cacheManager: Cache) {}

  @Get()
  async getSetConfig(): Promise<any> {
    const cachedConfig = await this._cacheManager.get('service_config')
    if (cachedConfig) {
      console.log('Конфигурация загружена из кэша Redis')
      return cachedConfig
    }

    const configPath = path.join(__dirname, 'assets/config.json')
    const configData = fs.readFileSync(configPath, 'utf8')
    const parsedConfig = JSON.parse(configData)

    await this._cacheManager.set('service_config', parsedConfig, 3600)

    console.log('Конфигурация загружена из файла и сохранена в Redis')
    return await this._cacheManager.get('service_config')
  }
}
