import { DeliusServiceUser, DeliusUser } from '../../services/communityApiService'
import { ReferralFields, ServiceCategory } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'

export default class ShowReferralPresenter {
  constructor(
    private readonly referralFields: ReferralFields,
    private readonly serviceCategory: ServiceCategory,
    private readonly sentBy: DeliusUser,
    private readonly serviceUser: DeliusServiceUser
  ) {}

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)} referral for ${ReferralDataPresenterUtils.fullName(
      this.referralFields.serviceUser
    )}`,
  }

  readonly probationPractitionerDetails: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.firstName} ${this.sentBy.surname}`], isList: false },
    { key: 'Email address', lines: [this.sentBy.email ?? ''], isList: false },
  ]

  readonly serviceUserNotificationBannerArgs = {
    titleText: 'Service user details',
    html:
      `<p class="govuk-notification-banner__heading">${this.serviceUser.firstName} ${this.serviceUser.surname}<p>` +
      `<p>Date of birth: ${this.serviceUserDateOfBirth}</p>` +
      `<p class="govuk-body">${this.serviceUserMobile} | ${this.serviceUserEmail}</p>`,
  }

  private get serviceUserDateOfBirth(): string {
    const { dateOfBirth } = this.serviceUser

    const notFoundMessage = 'Not found'

    if (dateOfBirth) {
      const iso8601DateOfBirth = CalendarDay.parseIso8601(dateOfBirth)

      return iso8601DateOfBirth ? ReferralDataPresenterUtils.govukFormattedDate(iso8601DateOfBirth) : notFoundMessage
    }

    return notFoundMessage
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
