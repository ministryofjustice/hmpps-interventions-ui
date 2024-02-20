import ServiceProviderOrganization from './hmppsAuth/serviceProviderOrganization'
import Token from './hmppsAuth/token'
import User from './hmppsAuth/user'

export default interface LoggedInUser extends User {
  name: string
  organizations: ServiceProviderOrganization[]
  token: Token
  email: string
}
