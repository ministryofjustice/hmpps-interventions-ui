import MockRestClient from '../../../data/testutils/mockRestClient'
import AssessRisksAndNeedsService from '../../../services/assessRisksAndNeedsService'
import MockedHmppsAuthService from '../../../services/testutils/hmppsAuthServiceSetup'

export default class MockAssessRisksAndNeedsService extends AssessRisksAndNeedsService {
  constructor() {
    super(new MockedHmppsAuthService(), new MockRestClient(), true)
  }
}
