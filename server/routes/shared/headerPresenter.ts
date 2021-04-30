import LoggedInUser from '../../models/loggedInUser'
import utils from '../../utils/utils'

export default class HeaderPresenter {
  constructor(private readonly loggedInUser: LoggedInUser | null) {}

  get userDescription(): string {
    if (!this.loggedInUser) {
      return ''
    }

    let result = this.displayName

    if (this.loggedInUser.organizations?.length) {
      // fixme: it's possible that a user belongs to multiple organizations
      result += ` (${this.loggedInUser.organizations![0].name})`
    }

    return result
  }

  private get displayName(): string {
    const nameParts = utils.convertToTitleCase(this.loggedInUser!.name).split(' ')
    return `${nameParts[0][0]}. ${nameParts.reverse()[0]}`
  }
}
