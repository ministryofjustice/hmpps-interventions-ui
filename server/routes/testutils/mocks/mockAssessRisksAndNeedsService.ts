import MockRestClient from '../../../data/testutils/mockRestClient'
import AssessRisksAndNeedsService from '../../../services/assessRisksAndNeedsService'

export default class MockAssessRisksAndNeedsService extends AssessRisksAndNeedsService {
  constructor() {
    super(new MockRestClient(), true)
  }
}
