import UserService, { UserDetails } from '../../../services/userService'
import MockedHmppsAuthClient from '../../../data/testutils/hmppsAuthClientSetup'

export const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'J. Smith',
  token: 'token',
  authSource: 'nomis',
  userId: '123',
}

export class MockUserService extends UserService {
  constructor() {
    super(new MockedHmppsAuthClient())
  }

  async getUserDetails(_token: string): Promise<UserDetails> {
    return {
      ...user,
    }
  }
}
