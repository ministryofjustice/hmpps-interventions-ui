import ServiceProviderOrganization from '../models/hmppsAuth/serviceProviderOrganization'
import { AuthError, ErrorType } from '../authentication/authErrorHandler'
import LoggedInUser from '../models/loggedInUser'

function getServiceProviderUserOrganization(user: LoggedInUser): ServiceProviderOrganization {
  const { authSource, organizations } = user

  if (authSource !== 'auth') {
    throw new AuthError(ErrorType.REQUIRES_SP_USER)
  }

  if (organizations.length === 0) {
    throw new AuthError(ErrorType.NO_SP_ORG)
  }

  // for now we just take the first listed organization - this will change
  // when we implement the prime/subcontractor authorization work.
  return organizations[0]
}

function getProbationPractitionerUserId(user: LoggedInUser): string {
  const { userId, authSource } = user
  if (authSource !== 'delius') {
    throw new AuthError(ErrorType.REQUIRES_PP_USER)
  }

  return userId
}

export default {
  getServiceProviderUserOrganization,
  getProbationPractitionerUserId,
}
