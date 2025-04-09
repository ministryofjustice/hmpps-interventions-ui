import { createClient } from 'redis'
import logger from '../../log'
import { createRedisClient } from '../data/redisClient'

export default function setUpWebSession(): ReturnType<typeof createClient> {
  const client = createRedisClient()
  client
    .connect()
    .then(() => logger.info('App Redis connected'))
    .catch((error: Error) => {
      logger.error({ err: error }, 'App Redis connect error')
    })

  return client
}
