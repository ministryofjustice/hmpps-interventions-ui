import superagent, { Response } from 'superagent'
import querystring from 'querystring'
import redis from 'redis'
import { promisify } from 'util'
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
  port: config.redis.port,
  password: config.redis.password,
  host: config.redis.host,
  tls: config.redis.tls_enabled === 'true' ? {} : false,
  prefix: 'systemToken:',
})

redisClient.on('error', error => {
  logger.error({ err: error }, 'Redis error')
})

const getRedisAsync = promisify(redisClient.get).bind(redisClient)
const setRedisAsync = promisify<string, string, string, number>(redisClient.set).bind(redisClient)

export default class HmppsAuthService {
  private restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  async getUserDetails(userToken: string): Promise<UserDetails> {
    logger.info(`Getting current user details: calling HMPPS Auth`)
    return (await this.restClient(userToken).get({ path: '/api/user/me' })) as UserDetails
  }

  async getUserDetailsByUsername(userToken: string, username: string): Promise<UserDetails> {
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

  async getSPUserByUsername(token: string, username: string): Promise<AuthUserDetails> {
    logger.info(`Getting user detail by username: calling HMPPS Auth`)
    return (await this.restClient(token).get({
      path: `/api/authuser/${username}`,
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
    const redisKey = '%ANONYMOUS%'

    const tokenFromRedis = await getRedisAsync(redisKey)
    if (tokenFromRedis) {
      return tokenFromRedis
    }

    const newToken = await this.apiClientTokenRequest()

    // set TTL slightly less than expiry of token. Async but no need to wait
    await setRedisAsync(redisKey, newToken.body.access_token, 'EX', newToken.body.expires_in - 60)

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
