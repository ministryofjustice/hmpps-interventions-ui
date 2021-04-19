import { ServiceProviderOrg } from '../services/userService'
import { AuthError, ErrorType } from '../authentication/authErrorHandler'
import { User } from '../authentication/passport'

function getServiceProviderUserOrganization(user: User): ServiceProviderOrg {
  const { organizations } = user
  if (organizations === undefined) {
    throw new AuthError(ErrorType.REQUIRES_SP_USER)
  }

  if (organizations.length === 0) {
    throw new AuthError(ErrorType.NO_SP_ORG)
  }

  // for now we just take the first listed organization - this will change
  // when we implement the prime/subcontractor authorization work.
  return organizations[0]
}

function getProbationPractitionerUserId(user: User): string {
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
