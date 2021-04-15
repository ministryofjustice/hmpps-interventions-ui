import Logger from 'bunyan'
import type { ResponseError } from 'superagent'
import config from './server/config'

const level = config.production || config.testMode ? 'warn' : 'debug'

function responseErrorSerializer(err: ResponseError) {
  const baseErr = Logger.stdSerializers.err(err)
  return err.response
    ? {
        ...baseErr,
        text: err.response.text,
        status: err.response.status,
        headers: err.response.headers,
        data: err.response.body,
      }
    : baseErr
}

export function loggerFactory(fields: { [custom: string]: unknown } = {}, name = 'interventions'): Logger {
  return Logger.createLogger({
    name,
    level,
    stream: process.stdout,
    serializers: { ...Logger.stdSerializers, err: responseErrorSerializer },
    ...fields,
  })
}

const defaultLogger = loggerFactory()
export default defaultLogger
