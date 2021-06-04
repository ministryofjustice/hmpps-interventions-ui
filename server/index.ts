import createApp from './app'
import HmppsAuthService from './services/hmppsAuthService'
import CommunityApiService from './services/communityApiService'
import config from './config'
import InterventionsService from './services/interventionsService'

const hmppsAuthService = new HmppsAuthService()
const communityApiService = new CommunityApiService(hmppsAuthService)
const interventionsService = new InterventionsService(config.apis.interventionsService)

const app = createApp(communityApiService, interventionsService, hmppsAuthService)

export default app
