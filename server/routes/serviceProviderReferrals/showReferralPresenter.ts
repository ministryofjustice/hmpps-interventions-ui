import { DeliusServiceUser, DeliusUser } from '../../services/communityApiService'
import { ReferralFields, ServiceCategory } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import ReferralDataPresenterUtils from '../referrals/referralDataPresenterUtils'
import ServiceUserDetailsPresenter from '../referrals/serviceUserDetailsPresenter'

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

  get serviceUserDetails(): SummaryListItem[] {
    return new ServiceUserDetailsPresenter(this.referralFields.serviceUser).summary
  }

  get serviceUserRisks(): SummaryListItem[] {
    return [
      { key: 'Risk to known adult', lines: ['Medium'], isList: false },
      { key: 'Risk to public', lines: ['Low'], isList: false },
      { key: 'Risk to children', lines: ['Low'], isList: false },
      { key: 'Risk to staff', lines: ['Low'], isList: false },
      { key: 'Additional risk information', lines: [this.referralFields.additionalRiskInformation], isList: false },
    ]
  }

  get serviceUserNeeds(): SummaryListItem[] {
    return [
      { key: 'Criminogenic needs', lines: ['Thinking and attitudes', 'Accommodation'], isList: true },
      {
        key: 'Identify needs',
        lines: [this.referralFields.additionalNeedsInformation || 'N/A'],
        isList: false,
      },
      {
        key: 'Other mobility, disability or accessibility needs',
        lines: [this.referralFields.accessibilityNeeds || 'N/A'],
        isList: false,
      },
      { key: 'Interpreter required', lines: [this.referralFields.needsInterpreter ? 'Yes' : 'No'], isList: false },
      { key: 'Interpreter language', lines: [this.referralFields.interpreterLanguage || 'N/A'], isList: false },
      {
        key: 'Primary language',
        lines: [this.referralFields.serviceUser.preferredLanguage || 'N/A'],
        isList: false,
      },
      {
        key: 'Caring or employment responsibilities',
        lines: [this.referralFields.hasAdditionalResponsibilities ? 'Yes' : 'No'],
        isList: false,
      },
      {
        key: `Provide details of when ${this.referralFields.serviceUser.firstName} will not be able to attend sessions`,
        lines: [this.referralFields.whenUnavailable || 'N/A'],
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
