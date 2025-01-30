import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { StartDto } from '@server/dtos/start.dto'
import { AddTask, TaskStatus } from '@server/dtos/task.dto'

import { TaskQueueService } from '../services/task-queue.service'

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskQueueService: TaskQueueService) {}

  @Post('run')
  async runTask(@Body() body: StartDto): Promise<AddTask> {
    return await this.taskQueueService.addTask({
      inputNum: body.inputNum,
      inputText: body.inputText,
    })
  }

  @Get('status/:id')
  async getTaskStatus(@Param('id') id: string): Promise<TaskStatus> {
    return await this.taskQueueService.getTaskStatus(id)
  }
}
