import createApp from './app'
import HmppsAuthService from './services/hmppsAuthService'
import CommunityApiService from './services/communityApiService'
import config from './config'
import InterventionsService from './services/interventionsService'
import RestClient from './data/restClient'
import AssessRisksAndNeedsService from './services/assessRisksAndNeedsService'

const assessRisksAndNeedsRestClient = new RestClient('assessRisksAndNeedsClient', config.apis.assessRisksAndNeedsApi)

const hmppsAuthService = new HmppsAuthService()
const communityApiService = new CommunityApiService(hmppsAuthService)
const interventionsService = new InterventionsService(config.apis.interventionsService)
const assessRisksAndNeedsService = new AssessRisksAndNeedsService(hmppsAuthService, assessRisksAndNeedsRestClient)

const app = createApp(communityApiService, interventionsService, hmppsAuthService, assessRisksAndNeedsService)

export default app
