import { Injectable, Logger } from '@nestjs/common'
import { DatabaseEntity } from '@server/entities/task.entity'
import { DataSource, QueryRunner } from 'typeorm'

@Injectable()
export class DatabaseService {
  private readonly _logger = new Logger(DatabaseService.name)

  constructor(private readonly _dataSource: DataSource) {}

  async saveTask(inputNum: number, inputText: string, result: string) {
    const queryRunner: QueryRunner = this._dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ COMMITTED')

    try {
      const entity: DatabaseEntity = await queryRunner.manager.save(
        queryRunner.manager.create(DatabaseEntity, { inputNum, inputText, result }),
      )

      this._logger.log(`Task saved: ${entity}`)
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.handleError(this.saveTask.name, error)
    } finally {
      await queryRunner.release()
    }
  }

  async getHistory(): Promise<DatabaseEntity[]> {
    const queryRunner: QueryRunner = this._dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction('READ COMMITTED')

    try {
      const entity: DatabaseEntity[] = await queryRunner.manager.find(DatabaseEntity)
      this._logger.log(`Task saved: ${entity}`)
      await queryRunner.commitTransaction()
      return entity
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.handleError(this.saveTask.name, error)
    } finally {
      await queryRunner.release()
    }
  }

  handleError(name: string, error: any) {
    if (!error.message && !error.stack) {
      this._logger.error(error, name)
      throw new Error(error)
    } else if (error.message && error.stack) {
      this._logger.error(error.message, error.stack, name)
      throw new Error(error.message)
    } else {
      throw new Error(
        JSON.stringify({
          code: 'UNEXPECTED_ERROR',
          message: error.message,
        }),
      )
    }
  }
}
