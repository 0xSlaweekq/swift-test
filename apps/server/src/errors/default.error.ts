import { randomUUID } from 'crypto'

import { HttpException } from '@nestjs/common'
import BigNumber from 'bignumber.js'

export class DefaultError extends Error {
  id = randomUUID()

  code = '000'
  originalCode: undefined | string | number = undefined
  override name = 'DEFAULT_ERROR'
  metadata?: object[]

  cause: any

  constructor(dto?: { cause?: any; context?: string; message?: string | object; metadata?: object | object[] }) {
    let messageStr = ''

    if (typeof dto?.message === 'string') {
      messageStr = dto.message.trim()
    } else if (dto?.message instanceof Error) {
      messageStr = dto.message.message.trim()
    } else if (dto?.message) {
      messageStr = DefaultError._stringifyAny(dto?.message).trim()
    }

    const contextStr = dto?.context?.trim() && messageStr ? `(${dto.context.trim()}) ` : ''

    super(contextStr + messageStr)

    this.cause = dto?.cause
    this.originalCode = dto?.cause?.code

    if (dto?.metadata) {
      this.metadata = dto.metadata instanceof Array ? dto.metadata : [dto.metadata]
    }
  }

  addMetadata(additionalMetadata: object) {
    this.metadata = this.metadata || []
    this.metadata.push(additionalMetadata)
  }

  static _stringifyAny(obj: any): string {
    const startTimeMark = process.hrtime()

    if (obj === undefined || obj === null) {
      return ''
    }

    if (typeof obj === 'string') {
      return obj
    }

    if (typeof obj === 'number') {
      return String(obj)
    }

    if (typeof obj === 'boolean') {
      return String(obj)
    }

    let result = ''

    try {
      if (!result) {
        result = JSON.stringify(obj)
      }
    } catch {
      /*  */
    }

    try {
      if (!result) {
        result = String(obj)
      }
    } catch {
      /*  */
    }

    const [, elapsedNano] = process.hrtime(startTimeMark)

    if (elapsedNano >= 100 * 1000) {
      console.warn(`${Math.ceil(elapsedNano / 1000)} milliseconds taken to stringify any in ${DefaultError.name}:`, obj)
    }

    return result
  }

  toHttp(code?: number, additionalBodyFields?: Record<string, any>) {
    const c = BigNumber(code || this.code || 0)

    const e = new HttpException(
      HttpException.createBody({
        id: this.id,
        statusCode: c.isNaN() ? 0 : c.toNumber(),
        message: this.message,
        ...(additionalBodyFields || {}),
      }),
      c.isNaN() ? 0 : c.toNumber(),
    )

    return e
  }
}
