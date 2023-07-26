import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import utils from '../../utils/utils'
import DateUtils from '../../utils/dateUtils'

export default class ServiceUserBannerPresenter {
  constructor(private readonly serviceUser: DeliusServiceUser) {}

  get name(): string {
    return utils.convertToTitleCase(`${this.serviceUser.name.forename} ${this.serviceUser.name.surname}`)
  }

  get dateOfBirth(): string {
    return this.serviceUser.dateOfBirth ? DateUtils.formattedDate(this.serviceUser.dateOfBirth) : 'Not found'
  }

  get serviceUserEmail(): string {
    const { emailAddress } = this.serviceUser.contactDetails

    if (emailAddress && emailAddress.length > 0) {
      return emailAddress
    }

    return 'Not found'
  }

  get serviceUserMobile(): string {
    const { mobileNumber } = this.serviceUser.contactDetails
    const notFoundMessage = 'Not found'
    return mobileNumber || notFoundMessage
  }

  get crn(): string {
    return this.serviceUser.crn
  }
}
