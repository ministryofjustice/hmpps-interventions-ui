import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import UserService from './services/userService'
import CommunityApiService from './services/communityApiService'
import config from './config'
import InterventionsService from './services/interventionsService'

const hmppsAuthClient = new HmppsAuthClient()
const userService = new UserService(hmppsAuthClient)
const communityApiService = new CommunityApiService(hmppsAuthClient)
const interventionsService = new InterventionsService(config.apis.interventionsService)

const app = createApp(userService, communityApiService, interventionsService)

export default app
