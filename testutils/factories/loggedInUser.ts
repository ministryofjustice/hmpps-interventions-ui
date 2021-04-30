import { Factory } from 'fishery'
import LoggedInUser from '../../server/models/loggedInUser'

export default Factory.define<LoggedInUser>(() => ({
  name: 'john smith',
  username: 'user1',
  token: {
    accessToken: 'token',
    expiry: 7265674811, // tests will fail in ~180 years
    roles: [],
  },
  authSource: 'nomis',
  userId: '123',
  organizations: [],
}))
