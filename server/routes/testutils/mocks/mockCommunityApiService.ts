import CommunityApiService from '../../../services/communityApiService'
import MockedHmppsAuthService from '../../../services/testutils/hmppsAuthServiceSetup'
import MockRestClient from '../../../data/testutils/mockRestClient'

export default class MockCommunityApiService extends CommunityApiService {
  constructor() {
    super(new MockedHmppsAuthService(), new MockRestClient())
  }
}
