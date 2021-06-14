import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import utils from '../../utils/utils'
import PresenterUtils from '../../utils/presenterUtils'

export default class ServiceUserBannerPresenter {
  constructor(private readonly serviceUser: DeliusServiceUser) {}

  get name(): string {
    return utils.convertToTitleCase(`${this.serviceUser.firstName} ${this.serviceUser.surname}`)
  }

  get dateOfBirth(): string {
    return PresenterUtils.govukFormattedDateFromStringOrNull(this.serviceUser.dateOfBirth)
  }

  get serviceUserEmail(): string {
    const { emailAddresses } = this.serviceUser.contactDetails

    if (emailAddresses && emailAddresses.length > 0) {
      return emailAddresses[0]
    }

    return 'Not found'
  }

  get serviceUserMobile(): string {
    const { phoneNumbers } = this.serviceUser.contactDetails
    const notFoundMessage = 'Not found'

    if (phoneNumbers) {
      const mobileNumber = phoneNumbers.find(phoneNumber => phoneNumber.type === 'MOBILE')

      return mobileNumber && mobileNumber.number ? mobileNumber.number : notFoundMessage
    }

    return notFoundMessage
  }

  get crn(): string {
    return this.serviceUser.otherIds.crn
  }
}
