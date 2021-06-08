import nock from 'nock'
import redis from 'redis'

import config from '../config'
import HmppsAuthService from './hmppsAuthService'

const token = { access_token: 'token-1', expires_in: 300 }
const authUser = { username: 'AUTH_ADM', authSource: 'auth', userId: '123456' }
const deliusUser = { username: 'bernard.beaks', authSource: 'delius', userId: '123456' }

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

const mockRedis = redis as unknown as MockRedis

function givenRedisResponse(storedToken: string | null) {
  mockRedis.get.mockImplementation((key, callback) => callback(null, storedToken))
}

describe('hmppsAuthService', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthService: HmppsAuthService

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    hmppsAuthService = new HmppsAuthService()
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

      const output = await hmppsAuthService.getUserDetails(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getSPUserByEmailAddress', () => {
    describe('when a matching user is found with the requested email address', () => {
      it('should return the first active and verified user from the API response', async () => {
        const response = [
          {
            userId: 'D89C09A9-1FAC-476D-91F8-E0EDCA10ECAF',
            username: 'disable user account',
            email: 'user@example.com',
            firstName: 'Auth',
            lastName: 'User',
            locked: false,
            enabled: false,
            verified: true,
            lastLoggedIn: '01/01/2001',
          },
          {
            userId: '91229A16-B5F4-4784-942E-A484A97AC865',
            username: 'authuser',
            email: 'user@example.com',
            firstName: 'Auth',
            lastName: 'User',
            locked: false,
            enabled: true,
            verified: true,
            lastLoggedIn: '01/01/2001',
          },
        ]

        fakeHmppsAuthApi
          .get('/api/authuser')
          .query({ email: 'user@example.com' })
          .matchHeader('authorization', `Bearer ${token.access_token}`)
          .reply(200, response)

        const output = await hmppsAuthService.getSPUserByEmailAddress(token.access_token, 'user@example.com')
        expect(output).toEqual(response[1])
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

        await expect(hmppsAuthService.getSPUserByEmailAddress(token.access_token, 'user@example.com')).rejects.toThrow(
          'Email not found'
        )
      })
    })

    describe('when no active or verified users are found with the requested email address', () => {
      it('should raise an error', async () => {
        const invalidUserResponse = [
          {
            userId: '91229A16-B5F4-4784-942E-A484A97AC865',
            username: 'verified_not_enabled',
            email: 'user@example.com',
            firstName: 'Auth',
            lastName: 'User',
            locked: true,
            enabled: false,
            verified: true,
            lastLoggedIn: '01/01/2001',
          },
          {
            userId: '4020F3FD-75F5-4962-BFB3-7C17E5F3D053',
            username: 'enabled_not_verified',
            email: 'user@example.com',
            firstName: 'Auth',
            lastName: 'User',
            locked: true,
            enabled: true,
            verified: false,
            lastLoggedIn: '01/01/2001',
          },
          {
            userId: '5C15EB69-DE44-4D78-9F87-EA577020BF2D',
            username: 'neither_verified_nor_enabled',
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
          .reply(200, invalidUserResponse)

        await expect(hmppsAuthService.getSPUserByEmailAddress(token.access_token, 'user@example.com')).rejects.toThrow(
          'No verified and active accounts found for this email address'
        )
      })
    })
  })

  describe('getSPUserByUsername', () => {
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

      const output = await hmppsAuthService.getSPUserByUsername(token.access_token, 'AUTH_ADM')
      expect(output).toEqual(response)
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', async () => {
      fakeHmppsAuthApi
        .get('/api/user/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsAuthService.getUserRoles(token.access_token)
      expect(output).toEqual(['role1', 'role2'])
    })
  })

  describe('getApiClientToken', () => {
    it('should instantiate the redis client', async () => {
      givenRedisResponse(token.access_token)
      await hmppsAuthService.getApiClientToken()
      expect(redis.createClient).toBeCalledTimes(1)
    })

    it('should return token from redis if one exists', async () => {
      givenRedisResponse(token.access_token)
      const output = await hmppsAuthService.getApiClientToken()
      expect(output).toEqual(token.access_token)
    })

    it('should return token from HMPPS Auth', async () => {
      givenRedisResponse(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.apiClientId, pass: config.apis.hmppsAuth.apiClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthService.getApiClientToken()

      expect(output).toEqual(token.access_token)
      expect(mockRedis.set).toBeCalledWith('%ANONYMOUS%', token.access_token, 'EX', 240, expect.any(Function))
    })
  })

  describe('getUserOrganizations', () => {
    beforeEach(() => {
      const groups = [
        {
          groupCode: 'RANDOM_GROUP',
          groupName: 'NPS West Yorks Staff',
        },
        {
          groupCode: 'INT_SP_HARMONY_LIVING',
          groupName: 'Int SP Harmony Living',
        },
        {
          groupCode: 'INT_SP_BETTER_LTD',
          groupName: 'Better Ltd.',
        },
      ]
      fakeHmppsAuthApi
        .get(`/api/authuser/${authUser.username}/groups`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, groups)
    })

    it('filters auth user groups', async () => {
      const result = await hmppsAuthService.getUserOrganizations(token.access_token, authUser)
      expect(result).toEqual([
        { id: 'HARMONY_LIVING', name: 'Harmony Living' },
        { id: 'BETTER_LTD', name: 'Better Ltd.' },
      ])
    })

    it('does not include auth user groups for delius users', async () => {
      const result = await hmppsAuthService.getUserOrganizations(token.access_token, deliusUser)
      expect(result).toEqual([])
    })
  })
})
