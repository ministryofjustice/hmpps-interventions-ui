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
  name: 'john smith',
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
          groupName: 'Harmony Living',
        },
      ])
      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue(deliusUser)
      const result = await userService.getUser(token)
      expect(result.displayName).toEqual('John Smith')
    })
    it('filters auth user groups', async () => {
      hmppsAuthClient.getUser.mockResolvedValue(authUser)
      const result = await userService.getUser(token)
      expect(result.organizations).toEqual([{ code: 'HARMONY_LIVING', name: 'Harmony Living' }])
    })
    it('does not include auth user groups for delius users', async () => {
      hmppsAuthClient.getUser.mockResolvedValue(deliusUser)
      const result = await userService.getUser(token)
      expect(result.organizations).toBeUndefined()
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
