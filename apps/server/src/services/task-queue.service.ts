import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { createServer } from 'http'
import * as path from 'path'

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { StartDto } from '@server/dtos/start.dto'
import { AddTask, TaskStatus } from '@server/dtos/task.dto'
import { Job, JobState, Queue, Worker } from 'bullmq'
import { WebSocket, WebSocketServer } from 'ws'

@Injectable()
export class TaskQueueService {
  private _loger: Logger = new Logger(TaskQueueService.name)
  private _queue: Queue
  private _wss: WebSocketServer

  constructor(private readonly configService: ConfigService) {
    const connection = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    }
    this._queue = new Queue('taskQueue', { connection })

    const server = createServer()
    const wsPort = this.configService.get<number>('APP_WS_PORT', 9003)
    this._wss = new WebSocketServer({ server })

    server.listen(wsPort, () => {
      this._loger.log(`WebSocket сервер запущен на порту ${wsPort}`)
    })

    this._wss.on('connection', (ws: WebSocket) => {
      this._loger.log('WebSocket подключен')

      ws.on('close', () => {
        this._loger.log('WebSocket отключен')
      })

      ws.on('message', (message) => {
        this._loger.log(`Получено сообщение: ${message}`)
      })
    })

    new Worker(
      'taskQueue',
      async (job: Job) => {
        this.broadcast({ jobId: job.id, status: 'processing' ,type:'task-status'})
        try {
          const result = await this.executeCommand({
            inputNum: job.data.inputNum,
            inputText: job.data.inputText,
          })

          this.broadcast({ jobId: job.id, status: 'completed', result })
          return result
        } catch (error) {
          this.broadcast({ jobId: job.id, status: 'failed', error })
          throw error
        }
      },
      { connection, concurrency: 1 },
    )
  }

  async addTask({ inputNum, inputText }: StartDto): Promise<AddTask> {
    this._loger.log('Добавление задачи:', { inputNum, inputText })

    const job = await this._queue.add('executeTask', { inputNum, inputText })
    this.broadcast({ jobId: job.id, status: 'queued' })
    return { jobId: job.id }
  }

  async getTaskStatus(jobId: string): Promise<TaskStatus> {
    const job: Job = await this._queue.getJob(jobId)
    if (!job) {
      return { status: 'not found' }
    }
    const state: JobState | unknown = await job.getState()
    return { status: state, result: await job.returnvalue }
  }

  async executeCommand(params: StartDto): Promise<string> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'assets/start.sh')
      const args: string[] = [String(params.inputNum), params.inputText]
      const process: ChildProcessWithoutNullStreams = spawn(scriptPath, args)

      let output = ''
      let errorOutput = ''

      process.stdout.on('data', (data): string => (output += data.toString()))
      process.stderr.on('data', (data): string => (errorOutput += data.toString()))

      process.on('close', (code: number): void => {
        if (code !== 0) {
          reject(`Ошибка выполнения: ${errorOutput}`)
        } else {
          resolve(output.trim())
        }
      })
    })
  }

  private broadcast(data: any): void {
    this._wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          ...data,
          type: 'task-status',
        }))
      }
    })
  }
}
