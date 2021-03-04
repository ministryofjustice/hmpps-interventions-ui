import { DeliusServiceUser } from '../../services/communityApiService'
import ViewUtils from '../../utils/viewUtils'

export default class ServiceUserBannnerPresenter {
  constructor(private readonly serviceUser: DeliusServiceUser) {}

  readonly serviceUserNotificationBannerArgs = {
    titleText: 'Service user details',
    html:
      `<p class="govuk-notification-banner__heading">${this.serviceUser.firstName} ${this.serviceUser.surname}<p>` +
      `<p>Date of birth: ${ViewUtils.govukFormattedDateFromStringOrNull(this.serviceUser.dateOfBirth)}</p>` +
      `<p class="govuk-body">${this.serviceUserMobile} | ${this.serviceUserEmail}</p>`,
  }

  private get serviceUserEmail(): string {
    const { emailAddresses } = this.serviceUser.contactDetails

    if (emailAddresses && emailAddresses.length > 0) {
      return emailAddresses[0]
    }

    return 'Email address not found'
  }

  private get serviceUserMobile(): string {
    const { phoneNumbers } = this.serviceUser.contactDetails
    const notFoundMessage = 'Mobile number not found'

    if (phoneNumbers) {
      const mobileNumber = phoneNumbers.find(phoneNumber => phoneNumber.type === 'MOBILE')

      return mobileNumber && mobileNumber.number ? mobileNumber.number : notFoundMessage
    }

    return notFoundMessage
  }
}
