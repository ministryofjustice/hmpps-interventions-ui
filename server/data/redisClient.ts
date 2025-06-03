import { createClient } from 'redis'

import logger from '../../log'
import config from '../config'

type RedisClient = ReturnType<typeof createClient>

const createRedisClient = (): ReturnType<typeof createClient> => {
  const useTls = config.redis.tls_enabled === 'true'
  const client = createClient({
    socket: {
      port: config.redis.port,
      host: config.redis.host!,
      ...(useTls ? { tls: true } : {}),
    },
    password: config.redis.password,
  })

  client.on('error', error => {
    logger.error({ err: error }, 'App Redis connect error')
  })

  return client
}

export { createRedisClient }

export type { RedisClient }
