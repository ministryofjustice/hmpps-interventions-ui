import superagent, { Response } from 'superagent'
import querystring from 'querystring'
import * as redis from 'redis'
import logger from '../../log'
import config from '../config'
import RestClient from '../data/restClient'
import UserDetails from '../models/hmppsAuth/userDetails'
import AuthUserDetails from '../models/hmppsAuth/authUserDetails'
import UserRole from '../models/hmppsAuth/role'
import UserGroup from '../models/hmppsAuth/group'
import ServiceProviderOrganization from '../models/hmppsAuth/serviceProviderOrganization'
import User from '../models/hmppsAuth/user'
import generateOauthClientBaiscAuthHeader from '../authentication/clientCredentials'

const redisClient = redis.createClient({
  legacyMode: true, // connect-redis only supports legacy mode for redis v4
  socket: {
    port: config.redis.port,
    host: config.redis.host,
    tls: config.redis.tls_enabled === 'true',
  },
  password: config.redis.password,
})

const REDIS_PREFIX = 'systemToken:' // prefix has been removed from redis config, so manually add it to key
const FAKE_SYSTEM_USER = 'hmpps-interventions-service' // see also https://github.com/ministryofjustice/hmpps-interventions-service/pull/1353

redisClient
  .connect()
  .then(() => logger.info('hmppsAuthService Redis connected'))
  .catch((error: Error) => {
    logger.error({ err: error }, 'hmppsAuthService Redis connect error')
  })
redisClient.on('error', error => {
  logger.error({ err: error }, 'hmppsAuthService Redis error')
})

export default class HmppsAuthService {
  private restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  async getUserDetails(userToken: string): Promise<UserDetails> {
    logger.info(`Getting current user details: calling HMPPS Auth`)
    return (await this.restClient(userToken).get({ path: '/api/user/me' })) as UserDetails
  }

  async getUserDetailsByUsername(userToken: string, username: string): Promise<UserDetails> {
    if (username === FAKE_SYSTEM_USER) {
      return {
        username,
        active: true,
        name: 'System',
        authSource: 'urn:hmpps:interventions',
        userId: '00000000-0000-0000-0000-000000000000',
        uuid: '00000000-0000-0000-0000-000000000000',
      } as UserDetails
    }

    logger.info(`Getting user details: calling HMPPS Auth`)
    return (await this.restClient(userToken).get({ path: `/api/user/${username}` })) as UserDetails
  }

  async getUserOrganizations(token: string, user: User): Promise<Array<ServiceProviderOrganization>> {
    return user.authSource === 'auth'
      ? (await this.getAuthUserGroups(token, user.username))
          .filter(group => group.groupCode.startsWith('INT_SP_'))
          .map(group => ({
            id: group.groupCode.replace(/^(INT_SP_)/, ''),
            name: group.groupName.replace(/^(Int SP )/, ''),
          }))
      : []
  }

  async getSPUserByEmailAddress(token: string, emailAddress: string): Promise<AuthUserDetails> {
    logger.info(`Getting auth user detail by email address: calling HMPPS Auth`)
    const res: Response = (await this.restClient(token).get({
      path: `/api/authuser`,
      query: { email: emailAddress },
      raw: true,
    })) as Response

    if (res.status === 204) {
      return Promise.reject(new Error('Email not found'))
    }

    const authUsers = (res.body as AuthUserDetails[]).filter(user => user.verified && user.enabled)

    if (authUsers.length === 0) {
      return Promise.reject(new Error('No verified and active accounts found for this email address'))
    }

    return Promise.resolve(authUsers[0])
  }

  async getSPUserByUsername(token: string, username: string, mustExist = true): Promise<AuthUserDetails> {
    return (await this.restClient(token)
      .get({ path: `/api/authuser/${username}` })
      .catch(error => {
        if (error.status !== 404) throw error
        if (mustExist) throw error
        else return { username, email: username }
      })) as AuthUserDetails
  }

  async getUserRoles(token: string): Promise<string[]> {
    return this.restClient(token)
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode)) as Promise<string[]>
  }

  async getAuthUserGroups(token: string, username: string): Promise<UserGroup[]> {
    return (await this.restClient(token).get({ path: `/api/authuser/${username}/groups` })) as UserGroup[]
  }

  async getApiClientToken(): Promise<string> {
    const redisKey = `${REDIS_PREFIX}%ANONYMOUS%`

    const tokenFromRedis = await redisClient.v4.get(redisKey)
    if (tokenFromRedis) {
      return tokenFromRedis
    }

    const newToken = await this.apiClientTokenRequest()

    // set TTL slightly less than expiry of token.
    await redisClient.v4.set(redisKey, newToken.body.access_token, { EX: newToken.body.expires_in - 60 })

    return newToken.body.access_token
  }

  private async apiClientTokenRequest(): Promise<superagent.Response> {
    const authRequest = querystring.stringify({ grant_type: 'client_credentials' })

    logger.info(
      {
        query: authRequest,
        clientId: config.apis.hmppsAuth.apiClientId,
      },
      'making token request to hmpps auth'
    )

    return superagent
      .post(`${config.apis.hmppsAuth.url}/oauth/token`)
      .set(
        'Authorization',
        generateOauthClientBaiscAuthHeader(config.apis.hmppsAuth.apiClientId, config.apis.hmppsAuth.apiClientSecret)
      )
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(authRequest)
      .timeout(config.apis.hmppsAuth.timeout)
  }
}
