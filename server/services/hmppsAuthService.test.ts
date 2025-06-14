import nock from 'nock'
import { createClient, RedisClientType } from 'redis'
import config from '../config'
import HmppsAuthService from './hmppsAuthService'

const token = { access_token: 'token-1', expires_in: 300 }
const authUser = { username: 'AUTH_ADM', authSource: 'auth', userId: '123456' }
const deliusUser = { username: 'bernard.beaks', authSource: 'delius', userId: '123456' }

const redis = {
  get: jest.fn().mockResolvedValue(true),
  set: jest.fn().mockImplementation((_key, _value, _options) => Promise.resolve(true)),
} as unknown as jest.Mocked<Pick<RedisClientType, 'get' | 'set'>>

function givenRedisResponse(storedToken: string | null) {
  redis.get.mockImplementation(_key => Promise.resolve(storedToken))
}

describe('hmppsAuthService', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthService: HmppsAuthService
  let fakeManagerUsersApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    fakeManagerUsersApi = nock(config.apis.hmppsManageUsersApi.url)
    hmppsAuthService = new HmppsAuthService(redis as unknown as ReturnType<typeof createClient>)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getCurrentUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeManagerUsersApi
        .get('/users/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthService.getUserDetails(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUserDetailsByUsername', () => {
    it('should return user details from api', async () => {
      const response = { username: 'user_1' }
      const username = 'user_1'

      fakeManagerUsersApi
        .get('/users/user_1')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthService.getUserDetailsByUsername(token.access_token, username)
      expect(output).toEqual(response)
    })

    it('should return system user for "hmpps-interventions-service" username', async () => {
      const username = 'hmpps-interventions-service'

      const output = await hmppsAuthService.getUserDetailsByUsername(token.access_token, username)
      expect(output).toEqual({
        username: 'hmpps-interventions-service',
        active: true,
        name: 'System',
        authSource: 'urn:hmpps:interventions',
        userId: '00000000-0000-0000-0000-000000000000',
        uuid: '00000000-0000-0000-0000-000000000000',
      })
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

        fakeManagerUsersApi
          .get('/externalusers')
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
        fakeManagerUsersApi
          .get('/externalusers')
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
        fakeManagerUsersApi
          .get('/externalusers')
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

      fakeManagerUsersApi
        .get('/externalusers/AUTH_ADM')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthService.getSPUserByUsername(token.access_token, 'AUTH_ADM')
      expect(output).toEqual(response)
    })

    it('should return stub user if not required and response is 404', async () => {
      fakeManagerUsersApi
        .get('/externalusers/MISSING')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(404, {})

      const output = await hmppsAuthService.getSPUserByUsername(token.access_token, 'MISSING')
      expect(output).toEqual('Deactivated R&M account')
    })

    it('raises an error if not required but response is non-404 4xx', async () => {
      fakeManagerUsersApi
        .get('/externalusers/MISSING')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(400, {})

      await expect(hmppsAuthService.getSPUserByUsername(token.access_token, 'MISSING')).rejects.toThrow('Bad Request')
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', async () => {
      fakeManagerUsersApi
        .get('/users/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsAuthService.getUserRoles(token.access_token)
      expect(output).toEqual(['role1', 'role2'])
    })
  })

  describe('getApiClientToken', () => {
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
      expect(redis.set).toBeCalledWith('systemToken:interventions:%ANONYMOUS%', token.access_token, { EX: 240 })
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
      fakeManagerUsersApi
        .get(`/externalusers/${authUser.userId}/groups`)
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
