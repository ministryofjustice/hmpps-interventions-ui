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
    interventionDetailsSummaryHeading: `${utils.convertToProperCase(this.serviceCategory.name)} intervention details`,
  }

  readonly probationPractitionerDetails: SummaryListItem[] = [
    { key: 'Name', lines: [`${this.sentBy.firstName} ${this.sentBy.surname}`], isList: false },
    { key: 'Email address', lines: [this.sentBy.email ?? ''], isList: false },
  ]

  get interventionDetails(): SummaryListItem[] {
    const selectedDesiredOutcomes = this.serviceCategory.desiredOutcomes
      .filter(desiredOutcome => this.referralFields.desiredOutcomesIds.includes(desiredOutcome.id))
      .map(desiredOutcome => desiredOutcome.description)

    const selectedComplexityLevel = this.serviceCategory.complexityLevels.find(
      complexityLevel => complexityLevel.id === this.referralFields.complexityLevelId
    )

    const complexityLevelText = {
      level: selectedComplexityLevel?.title || 'Level not found',
      text: selectedComplexityLevel?.description || 'Description not found',
    }

    return [
      { key: 'Sentence information', lines: ['Not currently set'], isList: false },
      { key: 'Desired outcomes', lines: selectedDesiredOutcomes, isList: true },
      { key: 'Complexity level', lines: [complexityLevelText.level, complexityLevelText.text], isList: false },
      {
        key: 'Date to be completed by',
        lines: [ShowReferralPresenter.govukFormattedDateFromStringOrNull(this.referralFields.completionDeadline)],
        isList: false,
      },
      {
        key: 'Maximum number of enforceable days',
        lines: [this.referralFields.usingRarDays ? String(this.referralFields.maximumRarDays) : 'N/A'],
        isList: false,
      },
      {
        key: 'Further information for the provider',
        lines: [this.referralFields.furtherInformation || 'N/A'],
        isList: false,
      },
    ]
  }

  readonly serviceUserNotificationBannerArgs = {
    titleText: 'Service user details',
    html:
      `<p class="govuk-notification-banner__heading">${this.serviceUser.firstName} ${this.serviceUser.surname}<p>` +
      `<p>Date of birth: ${ShowReferralPresenter.govukFormattedDateFromStringOrNull(
        this.serviceUser.dateOfBirth
      )}</p>` +
      `<p class="govuk-body">${this.serviceUserMobile} | ${this.serviceUserEmail}</p>`,
  }

  static govukFormattedDateFromStringOrNull(date: string | null): string {
    const notFoundMessage = 'Not found'

    if (date) {
      const iso8601date = CalendarDay.parseIso8601(date)

      return iso8601date ? ReferralDataPresenterUtils.govukFormattedDate(iso8601date) : notFoundMessage
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
