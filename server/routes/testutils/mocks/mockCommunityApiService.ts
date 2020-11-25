import CommunityApiService from '../../../services/communityApiService'

export = class MockCommunityApiService extends CommunityApiService {
  constructor() {
    super(undefined)
  }

  async getUserByUsername(username: string) {
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
