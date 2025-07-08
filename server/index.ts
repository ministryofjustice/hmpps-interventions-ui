import createApp from './app'
import config from './config'
import RestClient from './data/restClient'
import setupRedisClient from './middleware/setupRedisClient'
import AssessRisksAndNeedsService from './services/assessRisksAndNeedsService'
import HmppsAuthService from './services/hmppsAuthService'
import InterventionsService from './services/interventionsService'
import PrisonAndSecuredChildAgencyService from './services/prisonAndSecuredChildAgencyService'
import PrisonApiService from './services/prisonApiService'
import PrisonRegisterService from './services/prisonRegisterService'
import RamDeliusApiService from './services/ramDeliusApiService'
import AuditService from './services/auditService'
import ReferenceDataService from './services/referenceDataService'
import HmppsAuditClient from './data/hmppsAuditClient'

const assessRisksAndNeedsRestClient = new RestClient('assessRisksAndNeedsClient', config.apis.assessRisksAndNeedsApi)
const ramDeliusApiRestClient = new RestClient('ramDeliusApiClient', config.apis.ramDeliusApi)
const hmppsAuditClient = new HmppsAuditClient(config.sqs.audit)

const redisClient = setupRedisClient()

const hmppsAuthService = new HmppsAuthService(redisClient)
const ramDeliusApiService = new RamDeliusApiService(hmppsAuthService, ramDeliusApiRestClient)
const interventionsService = new InterventionsService(config.apis.interventionsService)
const assessRisksAndNeedsService = new AssessRisksAndNeedsService(assessRisksAndNeedsRestClient)
const referenceDataService = new ReferenceDataService()
const prisonRegisterService = new PrisonRegisterService()
const prisonApiService = new PrisonApiService()
const prisonAndSecuredChildAgencyService = new PrisonAndSecuredChildAgencyService(
  prisonRegisterService,
  prisonApiService
)
const auditService = new AuditService(hmppsAuditClient)

const app = createApp(
  ramDeliusApiService,
  interventionsService,
  hmppsAuthService,
  assessRisksAndNeedsService,
  referenceDataService,
  prisonRegisterService,
  prisonApiService,
  prisonAndSecuredChildAgencyService,
  redisClient,
  auditService
)

export default app
