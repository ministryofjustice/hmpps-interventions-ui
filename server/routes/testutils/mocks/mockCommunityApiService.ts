import CommunityApiService from '../../../services/communityApiService'
import DeliusUser from '../../../models/delius/deliusUser'
import MockedHmppsAuthClient from '../../../data/testutils/hmppsAuthClientSetup'

export = class MockCommunityApiService extends CommunityApiService {
  constructor() {
    super(new MockedHmppsAuthClient())
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
