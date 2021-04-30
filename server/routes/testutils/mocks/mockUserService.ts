import UserService, { UserDetails } from '../../../services/userService'
import MockedHmppsAuthClient from '../../../data/testutils/hmppsAuthClientSetup'
import { User } from '../../../authentication/passport'

export const user: User = {
  name: 'john smith',
  username: 'user1',
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
    }
  }
}
