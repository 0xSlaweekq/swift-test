import fs from 'fs'
import 'reflect-metadata'

import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { DefaultErrorFilter } from '@server/errors/default-filter.error'
import { AppModule } from '@server/modules/app.module'
import bodyParser from 'body-parser'
import { get } from 'env-var'

async function bootstrap() {
  const logger = new Logger(`AppBootstrap`)
  const app = await NestFactory.create(AppModule)

  const port = get('APP_PORT').required().asPortNumber()
  const hostname = get('APP_HOST').default('localhost').asString()
  const node = get('NODE_ENV').default('production').asString()

  const globalPrefix = 'api'

  app.setGlobalPrefix(globalPrefix)
  app.use(bodyParser.json({ limit: '50mb' }))
  app.useGlobalFilters(new DefaultErrorFilter())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('Server API')
    .setVersion('1')
    .setDescription('Documentation API for server')
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    include: [AppModule],
  })
  const swaggerUrl = 'api/docs'

  SwaggerModule.setup(swaggerUrl, app, document, {
    customSiteTitle: 'Server API',
  })

  if (node !== 'production') {
    fs.writeFileSync('./swagger-spec.json', JSON.stringify(document))
  }
  Logger.log('Swagger file updated')

  await app.listen(port, hostname).then(async () => {
    const appUrl = await app.getUrl()
    logger.log(`🚀 [Server] Rest is running on: ${appUrl}/api`)
    logger.log(`🚀 [Server] Swagger is running on: ${appUrl}/${swaggerUrl}`)
  })
}
bootstrap()
