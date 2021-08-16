import createApp from './app'
import HmppsAuthService from './services/hmppsAuthService'
import CommunityApiService from './services/communityApiService'
import config from './config'
import InterventionsService from './services/interventionsService'
import RestClient from './data/restClient'
import AssessRisksAndNeedsService from './services/assessRisksAndNeedsService'
import ReferenceDataService from './services/referenceDataService'

const assessRisksAndNeedsRestClient = new RestClient('assessRisksAndNeedsClient', config.apis.assessRisksAndNeedsApi)
const communityApiRestClient = new RestClient('communityApiClient', config.apis.communityApi)

const hmppsAuthService = new HmppsAuthService()
const communityApiService = new CommunityApiService(hmppsAuthService, communityApiRestClient)
const interventionsService = new InterventionsService(config.apis.interventionsService)
const assessRisksAndNeedsService = new AssessRisksAndNeedsService(
  assessRisksAndNeedsRestClient,
  config.apis.assessRisksAndNeedsApi.riskSummaryEnabled
)
const referenceDataService = new ReferenceDataService()

const app = createApp(
  communityApiService,
  interventionsService,
  hmppsAuthService,
  assessRisksAndNeedsService,
  referenceDataService
)

export default app
