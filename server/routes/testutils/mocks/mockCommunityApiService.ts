import CommunityApiService, { DeliusUser } from '../../../services/communityApiService'

export = class MockCommunityApiService extends CommunityApiService {
  constructor() {
    super(undefined)
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
