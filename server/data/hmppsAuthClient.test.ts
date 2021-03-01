import nock from 'nock'
import redis from 'redis'

import config from '../config'
import HmppsAuthClient from './hmppsAuthClient'

const username = 'Bob'
const token = { access_token: 'token-1', expires_in: 300 }

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnThis(),
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn().mockImplementation((key, value, command, ttl, callback) => callback(null, null)),
}))

interface MockRedis {
  on: jest.Mock
  get: jest.Mock
  set: jest.Mock
}

const mockRedis = (redis as unknown) as MockRedis

function givenRedisResponse(storedToken: string | null) {
  mockRedis.get.mockImplementation((key, callback) => callback(null, storedToken))
}

describe('hmppsAuthClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthClient: HmppsAuthClient

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    hmppsAuthClient = new HmppsAuthClient()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getCurrentUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeHmppsAuthApi
        .get('/api/user/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getCurrentUser(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUserByEmailAddress', () => {
    describe('when a matching user is found with the requested email address', () => {
      it('should return the first matching user from the API response', async () => {
        const response = [
          {
            userId: '91229A16-B5F4-4784-942E-A484A97AC865',
            username: 'authuser',
            email: 'user@example.com',
            firstName: 'Auth',
            lastName: 'User',
            locked: true,
            enabled: false,
            verified: false,
            lastLoggedIn: '01/01/2001',
          },
        ]

        fakeHmppsAuthApi
          .get('/api/authuser')
          .query({ email: 'user@example.com' })
          .matchHeader('authorization', `Bearer ${token.access_token}`)
          .reply(200, response)

        const output = await hmppsAuthClient.getUserByEmailAddress(token.access_token, 'user@example.com')
        expect(output).toEqual(response[0])
      })
    })

    describe('when no user is found with the requested email address', () => {
      it('should raise an error', async () => {
        const noUserResponse = {}
        fakeHmppsAuthApi
          .get('/api/authuser')
          .query({ email: 'user@example.com' })
          .matchHeader('authorization', `Bearer ${token.access_token}`)
          .reply(204, noUserResponse)

        await expect(hmppsAuthClient.getUserByEmailAddress(token.access_token, 'user@example.com')).rejects.toThrow(
          'Email not found'
        )
      })
    })
  })

  describe('getUserByUsername', () => {
    it('should return the matching user from the API response', async () => {
      const response = {
        userId: '91229A16-B5F4-4784-942E-A484A97AC865',
        username: 'authuser',
        email: 'user@example.com',
        firstName: 'Auth',
        lastName: 'User',
        locked: true,
        enabled: false,
        verified: false,
        lastLoggedIn: '01/01/2001',
      }

      fakeHmppsAuthApi
        .get('/api/authuser/AUTH_ADM')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getUserByUsername(token.access_token, 'AUTH_ADM')
      expect(output).toEqual(response)
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', async () => {
      fakeHmppsAuthApi
        .get('/api/user/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsAuthClient.getUserRoles(token.access_token)
      expect(output).toEqual(['role1', 'role2'])
    })
  })

  describe('getApiClientToken', () => {
    it('should instantiate the redis client', async () => {
      givenRedisResponse(token.access_token)
      await hmppsAuthClient.getApiClientToken(username)
      expect(redis.createClient).toBeCalledTimes(1)
    })

    it('should return token from redis if one exists', async () => {
      givenRedisResponse(token.access_token)
      const output = await hmppsAuthClient.getApiClientToken(username)
      expect(output).toEqual(token.access_token)
    })

    it('should return token from HMPPS Auth with username', async () => {
      givenRedisResponse(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials&username=Bob')
        .basicAuth({ user: config.apis.hmppsAuth.apiClientId, pass: config.apis.hmppsAuth.apiClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getApiClientToken(username)

      expect(output).toEqual(token.access_token)
      expect(mockRedis.set).toBeCalledWith('Bob', token.access_token, 'EX', 240, expect.any(Function))
    })

    it('should return token from HMPPS Auth without username', async () => {
      givenRedisResponse(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.apiClientId, pass: config.apis.hmppsAuth.apiClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getApiClientToken()

      expect(output).toEqual(token.access_token)
      expect(mockRedis.set).toBeCalledWith('Bob', token.access_token, 'EX', 240, expect.any(Function))
    })
  })
})
