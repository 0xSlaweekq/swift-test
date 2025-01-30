import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../apps/server/src/modules/app.module'

describe('API e2e tests', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/config (GET) should return JSON config', async () => {
    const res = await request(app.getHttpServer()).get('/config')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('name')
  })

  it('/tasks/run (POST) should add a task to queue', async () => {
    const res = await request(app.getHttpServer()).post('/tasks/run').send({ inputNum: 42, inputText: 'text1' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('jobId')
  })

  it('/history (GET) should return task history', async () => {
    const res = await request(app.getHttpServer()).get('/history')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  afterAll(async () => {
    await app.close()
  })
})
