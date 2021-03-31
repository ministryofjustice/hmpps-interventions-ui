import utils from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

export interface UserDetails {
  name: string
  displayName: string
  organizations?: ServiceProviderOrg[]
}

export interface ServiceProviderOrg {
  id: string
  name: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUserDetails(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getCurrentUser(token)
    const nameParts = utils.convertToTitleCase(user.name).split(' ')
    const displayName = `${nameParts[0][0]}. ${nameParts.reverse()[0]}`

    const organizations =
      user.authSource === 'auth'
        ? (await this.hmppsAuthClient.getAuthUserGroups(token, user.username))
            .filter(group => group.groupCode.startsWith('INT_SP_'))
            .map(group => ({
              id: group.groupCode.replace(/^(INT_SP_)/, ''),
              name: group.groupName.replace(/^(Int SP )/, ''),
            }))
        : undefined

    return { name: user.name, displayName, organizations }
  }
}
