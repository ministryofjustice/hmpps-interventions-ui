import config from '../../config'
import RestClient from '../restClient'

export default class MockRestClient extends RestClient {
  constructor() {
    super('', config.apis.assessRisksAndNeedsApi, '')
  }
}
