import createApp from './app'
import HmppsAuthService from './services/hmppsAuthService'
import config from './config'
import InterventionsService from './services/interventionsService'
import RestClient from './data/restClient'
import AssessRisksAndNeedsService from './services/assessRisksAndNeedsService'
import ReferenceDataService from './services/referenceDataService'
import PrisonRegisterService from './services/prisonRegisterService'
import RamDeliusApiService from './services/ramDeliusApiService'

const assessRisksAndNeedsRestClient = new RestClient('assessRisksAndNeedsClient', config.apis.assessRisksAndNeedsApi)
const ramDeliusApiRestClient = new RestClient('ramDeliusApiClient', config.apis.ramDeliusApi)

const hmppsAuthService = new HmppsAuthService()
const ramDeliusApiService = new RamDeliusApiService(hmppsAuthService, ramDeliusApiRestClient)
const interventionsService = new InterventionsService(config.apis.interventionsService)
const assessRisksAndNeedsService = new AssessRisksAndNeedsService(assessRisksAndNeedsRestClient)
const referenceDataService = new ReferenceDataService()
const prisonRegisterService = new PrisonRegisterService()

const app = createApp(
  ramDeliusApiService,
  interventionsService,
  hmppsAuthService,
  assessRisksAndNeedsService,
  referenceDataService,
  prisonRegisterService
)

export default app
