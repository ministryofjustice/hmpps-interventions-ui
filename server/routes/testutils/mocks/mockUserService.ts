import UserService from '../../../services/userService'
import MockedHmppsAuthClient from '../../../data/testutils/hmppsAuthClientSetup'

export const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
  token: 'token',
}

export class MockUserService extends UserService {
  constructor() {
    super(new MockedHmppsAuthClient())
  }

  async getUser(token: string) {
    return {
      ...user,
      token,
    }
  }
}
