import { JobState } from 'bullmq'

export class TaskStatus {
  status: JobState | string | unknown
  result?: any
}

export class AddTask {
  jobId: string
}
