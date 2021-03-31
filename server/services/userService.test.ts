import HmppsAuthClient from '../data/hmppsAuthClient'
import UserService from './userService'
import MockedHmppsAuthClient from '../data/testutils/hmppsAuthClientSetup'

const token = 'some token'
const authUser = {
  name: 'nadia hammond',
  authSource: 'auth',
  username: 'nhammond',
  userId: '1238764',
  active: true,
}
const deliusUser = {
  name: 'john percy smith',
  authSource: 'delius',
  username: 'johnsmith',
  userId: '123',
  active: true,
}

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new MockedHmppsAuthClient() as jest.Mocked<HmppsAuthClient>
      hmppsAuthClient.getAuthUserGroups.mockResolvedValue([
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
      ])
      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getCurrentUser.mockResolvedValue(deliusUser)
      const result = await userService.getUserDetails(token)
      expect(result.name).toEqual('john percy smith')
      expect(result.displayName).toEqual('J. Smith')
    })
    it('filters auth user groups', async () => {
      hmppsAuthClient.getCurrentUser.mockResolvedValue(authUser)
      const result = await userService.getUserDetails(token)
      expect(result.organizations).toEqual([
        { id: 'HARMONY_LIVING', name: 'Harmony Living' },
        { id: 'BETTER_LTD', name: 'Better Ltd.' },
      ])
    })
    it('does not include auth user groups for delius users', async () => {
      hmppsAuthClient.getCurrentUser.mockResolvedValue(deliusUser)
      const result = await userService.getUserDetails(token)
      expect(result.organizations).toBeUndefined()
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getCurrentUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUserDetails(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
