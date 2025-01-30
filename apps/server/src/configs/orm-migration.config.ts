import { config } from 'dotenv'
import { DataSource } from 'typeorm'

const envConfig = config()
const { DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = envConfig.parsed || {}

export const ormConfig = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_DATABASE,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  entities: [`src/**/*.entity{.ts,.js}`],
  migrations: [`migrations/*{.ts,.js}`],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
})

export const ormBaseConfig = {
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_DATABASE,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  cache: true,
  autoLoadEntities: true,
  synchronize: false,
  logging: false,
}
