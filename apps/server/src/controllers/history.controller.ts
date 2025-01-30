import { Controller, Get } from '@nestjs/common'
import { DatabaseEntity } from '@server/entities/task.entity'

import { DatabaseService } from '../services/database.service'

@Controller('history')
export class HistoryController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async getTaskHistory(): Promise<DatabaseEntity[]> {
    return await this.databaseService.getHistory()
  }
}
