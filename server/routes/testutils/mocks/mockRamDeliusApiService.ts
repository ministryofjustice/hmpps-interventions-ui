import MockedHmppsAuthService from '../../../services/testutils/hmppsAuthServiceSetup'
import MockRestClient from '../../../data/testutils/mockRestClient'
import RamDeliusApiService from '../../../services/ramDeliusApiService'

export default class MockRamDeliusApiService extends RamDeliusApiService {
  constructor() {
    super(new MockedHmppsAuthService(), new MockRestClient())
  }
}
