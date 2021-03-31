import UserService, { UserDetails } from '../../../services/userService'
import MockedHmppsAuthClient from '../../../data/testutils/hmppsAuthClientSetup'

export const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'J. Smith',
  token: {
    accessToken: 'token',
    expiry: 7265674811, // tests will fail in ~180 years
    roles: [],
  },
  authSource: 'nomis',
  userId: '123',
}

export class MockUserService extends UserService {
  constructor() {
    super(new MockedHmppsAuthClient())
  }

  async getUserDetails(_token: string): Promise<UserDetails> {
    return {
      name: user.name,
      displayName: user.displayName,
    }
  }
}
