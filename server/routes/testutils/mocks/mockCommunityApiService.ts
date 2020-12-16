import CommunityApiService, { DeliusUser } from '../../../services/communityApiService'
import MockedHmppsAuthClient from '../../../data/testutils/hmppsAuthClientSetup'

export = class MockCommunityApiService extends CommunityApiService {
  constructor() {
    super(new MockedHmppsAuthClient())
  }

  async getUserByUsername(username: string): Promise<DeliusUser> {
    return {
      userId: '987123876',
      username: 'maijam',
      firstName: 'Maija',
      surname: 'Meikäläinen',
      email: 'maijamm@justice.gov.uk',
      enabled: true,
      roles: [],
    }
  }
}
