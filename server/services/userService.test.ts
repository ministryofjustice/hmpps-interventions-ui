import HmppsAuthClient from '../data/hmppsAuthClient'
import UserService from './userService'
import MockedHmppsAuthClient from '../data/testutils/hmppsAuthClientSetup'

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new MockedHmppsAuthClient() as jest.Mocked<HmppsAuthClient>

      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({
        name: 'john smith',
        authSource: 'delius',
        username: 'johnsmith',
        userId: '123',
        active: true,
      })

      const result = await userService.getUser(token)

      expect(result.displayName).toEqual('John Smith')
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
