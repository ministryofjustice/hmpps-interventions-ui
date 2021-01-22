import convertToTitleCase from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

export interface UserDetails {
  name: string
  displayName: string
  userId: string
  organizations?: ServiceProviderOrg[]
}

export interface ServiceProviderOrg {
  code: string
  name: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private readonly serviceProviderGroupPrefix = 'INT_SP_'

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    const userDetails: UserDetails = { ...user, displayName: convertToTitleCase(user.name as string) }

    if (user.authSource === 'auth') {
      userDetails.organizations = (await this.hmppsAuthClient.getAuthUserGroups(token, user.username))
        .filter(group => group.groupCode.startsWith(this.serviceProviderGroupPrefix))
        .map(group => ({ code: group.groupCode, name: group.groupName }))
    }

    return userDetails
  }
}
