import superagent from 'superagent'
import querystring from 'querystring'
import redis from 'redis'
import { promisify } from 'util'

import logger from '../../log'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import RestClient from './restClient'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url
const redisClient = redis.createClient({
  port: config.redis.port,
  password: config.redis.password,
  host: config.redis.host,
  tls: config.redis.tls_enabled === 'true' ? {} : false,
  prefix: 'systemToken:',
})

redisClient.on('error', error => {
  logger.error(error, `Redis error`)
})

const getRedisAsync = promisify(redisClient.get).bind(redisClient)
const setRedisAsync = promisify<string, string, string, number>(redisClient.set).bind(redisClient)

function getApiClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(config.apis.hmppsAuth.apiClientId, config.apis.hmppsAuth.apiClientSecret)

  const authRequest = username
    ? querystring.stringify({ grant_type: 'client_credentials', username })
    : querystring.stringify({ grant_type: 'client_credentials' })

  logger.info(
    `HMPPS Auth request '${authRequest}' for client id '${config.apis.hmppsAuth.apiClientId}' and user '${username}'`
  )

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(authRequest)
    .timeout(timeoutSpec)
}

interface User {
  name: string
  userId: string
  username: string
  authSource: string
  active: boolean
}

interface UserRole {
  roleCode: string
}

interface UserGroup {
  groupCode: string
  groupName: string
}

export default class HmppsAuthClient {
  private restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  getUser(token: string): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return this.restClient(token).get({ path: '/api/user/me' }) as Promise<User>
  }

  getUserRoles(token: string): Promise<string[]> {
    return this.restClient(token)
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode)) as Promise<string[]>
  }

  getAuthUserGroups(token: string, username: string): Promise<UserGroup[]> {
    return this.restClient(token).get({ path: `/api/authuser/${username}/groups` }) as Promise<UserGroup[]>
  }

  async getApiClientToken(username?: string): Promise<string> {
    const redisKey = username || '%ANONYMOUS%'

    const tokenFromRedis = await getRedisAsync(redisKey)
    if (tokenFromRedis) {
      return tokenFromRedis
    }

    const newToken = await getApiClientTokenFromHmppsAuth(username)

    // set TTL slightly less than expiry of token. Async but no need to wait
    await setRedisAsync(redisKey, newToken.body.access_token, 'EX', newToken.body.expires_in - 60)

    return newToken.body.access_token
  }
}
