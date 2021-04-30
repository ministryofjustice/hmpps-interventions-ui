import CommunityApiService from '../../../services/communityApiService'
import DeliusUser from '../../../models/delius/deliusUser'
import MockedHmppsAuthService from '../../../services/testutils/hmppsAuthServiceSetup'

export = class MockCommunityApiService extends CommunityApiService {
  constructor() {
    super(new MockedHmppsAuthService())
  }

  async getUserByUsername(_username: string): Promise<DeliusUser> {
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
