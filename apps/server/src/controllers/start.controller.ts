import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { StartDto } from '@server/dtos/start.dto'
import { TaskQueueService } from '@server/services'
import { validate } from 'class-validator'

@Controller('start')
export class StartController {
  constructor(private _taskQueueService: TaskQueueService) {}
  @Post()
  async startScript(@Body() params: StartDto): Promise<string> {
    const errors = await validate(params)
    console.log('Получены данные:', { params })

    if (errors.length > 0) {
      throw new BadRequestException(errors)
    }

    return await this._taskQueueService.executeCommand(params)
  }
}
