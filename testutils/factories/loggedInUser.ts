import { Factory } from 'fishery'
import jwt from 'jsonwebtoken'
import LoggedInUser from '../../server/models/loggedInUser'
import oauth2TokenFactory from './oauth2Token'
import Token from '../../server/models/hmppsAuth/token'

class LoggedInUserFactory extends Factory<LoggedInUser> {
  probationUser() {
    return this.params({
      token: jwt.decode(oauth2TokenFactory.probationPractitionerToken().build()) as Token,
    })
  }

  crsServiceProviderUser() {
    return this.params({
      token: jwt.decode(oauth2TokenFactory.serviceProviderToken().build()) as Token,
    })
  }
}

export default LoggedInUserFactory.define(() => ({
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
