import { Catch, ExceptionFilter, Logger } from '@nestjs/common'

import { DefaultError } from './default.error'

@Catch(DefaultError)
export class DefaultErrorFilter implements ExceptionFilter {
  catch(e: DefaultError) {
    let text = `Id: ${e.id} | Message: ${e.message} | Args: ${JSON.stringify(e.metadata?.reverse() || []) || ''}`

    if (e.stack) {
      text += `\nStacktrace: ${e.stack}`
    }

    if (e.cause?.stack) {
      text += `\nOriginal stacktrace: ${e.cause?.stack}`
    }

    Logger.error(text, undefined, DefaultErrorFilter.name)
  }
}
