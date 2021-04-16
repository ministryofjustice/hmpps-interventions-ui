import { ServiceProviderOrg, UserDetails } from '../services/userService'

function getSPUserOrganization(userDetails: UserDetails): ServiceProviderOrg {
  const { organizations } = userDetails
  if (organizations === undefined) {
    throw new Error('user is not an SP user')
  }

  if (organizations.length === 0) {
    throw new Error('user is not associated with a service provider organization')
  }

  // for now we just take the first listed organization - this will change
  // when we implement the prime/subcontractor authorization work.
  return organizations[0]
}

export default {
  getSPUserOrganization,
}
