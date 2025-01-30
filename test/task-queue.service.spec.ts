import { Test, TestingModule } from '@nestjs/testing'
import { TaskQueueService } from '../apps/server/src/services/task-queue.service'

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: '123' }),
    getJob: jest.fn().mockResolvedValue({
      getState: jest.fn().mockResolvedValue('completed'),
      returnvalue: 'Test result',
    }),
  })),
}))

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    connect: jest.fn(),
  }),
}))

describe('TaskQueueService', () => {
  let service: TaskQueueService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskQueueService],
    }).compile()

    service = module.get<TaskQueueService>(TaskQueueService)
  })

  it('should add task to queue', async () => {
    const response = await service.addTask(42, 'text1')
    expect(response).toEqual({ jobId: '123' })
  })

  it('should return task status', async () => {
    const response = await service.getTaskStatus('123')
    expect(response).toEqual({ status: 'completed', result: 'Test result' })
  })
})
