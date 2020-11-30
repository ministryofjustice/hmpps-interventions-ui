import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import UserService from './services/userService'
import CommunityApiService from './services/communityApiService'

const hmppsAuthClient = new HmppsAuthClient()
const userService = new UserService(hmppsAuthClient)
const communityApiService = new CommunityApiService(hmppsAuthClient)

const app = createApp(userService, communityApiService)

export default app
