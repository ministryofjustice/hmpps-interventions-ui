import { UUID } from 'aws-sdk/clients/cloudtrail'
import ServiceUser from '../../../models/serviceUser'
import { ListStyle, SummaryListItem } from '../../../utils/summaryList'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'
import ExpandedDeliusServiceUserDecorator from '../../../decorators/expandedDeliusServiceUserDecorator'
import DateUtils from '../../../utils/dateUtils'
import { CurrentLocationType } from '../../../models/draftReferral'
import utils from '../../../utils/utils'
import Prison from '../../../models/prisonRegister/prison'

export default class ServiceUserDetailsPresenter {
  readonly backLinkUrl: string

  constructor(
    private readonly serviceUser: ServiceUser,
    private readonly deliusServiceUserDetails: DeliusServiceUser,
    private readonly prisons: Prison[],
    private readonly referralId: UUID | null = null,
    private readonly personCurrentLocationType: CurrentLocationType | null = null,
    private readonly personCustodyPrisonId: string | null = null,
    private readonly popReleaseDate: string | null = null,
    private readonly popReleaseDateUnknownReason: string | null = null
  ) {
    this.backLinkUrl = `/referrals/${this.referralId}/form`
  }

  readonly serviceUserName =
    this.serviceUser.firstName && this.serviceUser.lastName
      ? [
          utils.convertToProperCase(this.serviceUser.firstName),
          utils.convertToProperCase(this.serviceUser.lastName),
        ].join(' ')
      : 'The person on probation'

  readonly title = `Review ${this.serviceUserName}'s information`

  readonly personDetailsHeading = 'Personal details'

  readonly contactDetailsHeading = 'Address and contact details'

  // required to force type erasure of type null[] from list of (string[] | null[])
  private notEmpty(value: string | null | undefined): value is string {
    return value !== null && value !== undefined
  }

  private findUniqueNumbers(): string[] {
    return [
      this.deliusServiceUserDetails.contactDetails?.telephoneNumber,
      this.deliusServiceUserDetails.contactDetails?.mobileNumber,
    ].filter(this.notEmpty)
  }

  get personalDetailsSummary(): SummaryListItem[] {
    const summary: SummaryListItem[] = [
      { key: 'First name', lines: [this.serviceUser.firstName ?? ''] },
      { key: 'Last name(s)', lines: [this.serviceUser.lastName ?? ''] },
      {
        key: 'Date of birth',
        lines: [this.dateOfBirthWithShortMonth ? `${this.dateOfBirthWithShortMonth} (${this.age} years old)` : ''],
      },
      { key: 'Gender', lines: [this.serviceUser.gender ?? ''] },
      { key: 'Ethnicity', lines: [this.serviceUser.ethnicity ?? ''] },
      { key: 'Preferred language', lines: [this.serviceUser.preferredLanguage ?? ''] },
      { key: 'Disabilities', lines: this.serviceUser.disabilities ?? [], listStyle: ListStyle.noMarkers },
      { key: 'Religion or belief', lines: [this.serviceUser.religionOrBelief ?? ''] },
    ]
    return summary
  }

  get contactDetailsSummary(): SummaryListItem[] {
    const phoneNumbers = this.findUniqueNumbers()
    const { address, email } = new ExpandedDeliusServiceUserDecorator(this.deliusServiceUserDetails)
    // const matchedPerson = this.prisons.find(prison => prison.prisonId === this.personCustodyPrisonId)
    // const prisonName = matchedPerson ? matchedPerson.prisonName : ''
    // ]
    return [
      {
        key: 'Address',
        lines: address || ['Not found'],
        listStyle: ListStyle.noMarkers,
      },
      {
        key: phoneNumbers.length > 1 ? 'Phone numbers' : 'Phone number',
        lines: phoneNumbers,
        listStyle: ListStyle.noMarkers,
      },
      {
        key: 'Email address',
        lines: email || [],
        listStyle: ListStyle.noMarkers,
      },
    ]
  }

  get checkAnswersSummary(): SummaryListItem[] {
    const { address, email } = new ExpandedDeliusServiceUserDecorator(this.deliusServiceUserDetails)
    const phoneNumbers = this.findUniqueNumbers()
    const summary: SummaryListItem[] = [
      { key: 'First name', lines: [this.serviceUser.firstName ?? ''] },
      { key: 'Last name(s)', lines: [this.serviceUser.lastName ?? ''] },
      {
        key: 'Date of birth',
        lines: [this.dateOfBirthWithShortMonth ? `${this.dateOfBirthWithShortMonth} (${this.age} years old)` : ''],
      },
      { key: 'Gender', lines: [this.serviceUser.gender ?? ''] },
      {
        key: 'Address',
        lines: address || ['Not found'],
        listStyle: ListStyle.noMarkers,
      },
      {
        key: phoneNumbers.length > 1 ? 'Phone numbers' : 'Phone number',
        lines: phoneNumbers,
        listStyle: ListStyle.noMarkers,
      },
      {
        key: 'Email address',
        lines: email || ['Not Found'],
        listStyle: ListStyle.noMarkers,
      },
      { key: 'Ethnicity', lines: [this.serviceUser.ethnicity ?? ''] },
      { key: 'Preferred language', lines: [this.serviceUser.preferredLanguage ?? ''] },
      { key: 'Disabilities', lines: this.serviceUser.disabilities ?? [], listStyle: ListStyle.noMarkers },
      { key: 'Religion or belief', lines: [this.serviceUser.religionOrBelief ?? ''] },
    ]
    return summary
  }

  get summary(): SummaryListItem[] {
    const { email } = new ExpandedDeliusServiceUserDecorator(this.deliusServiceUserDetails)
    const phoneNumbers = this.findUniqueNumbers()
    const { address } = new ExpandedDeliusServiceUserDecorator(this.deliusServiceUserDetails)
    const summary: SummaryListItem[] = [
      { key: 'CRN', lines: [this.serviceUser.crn] },
      { key: 'Title', lines: [this.serviceUser.title ?? ''] },
      { key: 'First name', lines: [this.serviceUser.firstName ?? ''] },
      { key: 'Last name', lines: [this.serviceUser.lastName ?? ''] },
      { key: 'Date of birth', lines: [this.dateOfBirth ? `${this.dateOfBirth} (${this.age} years old)` : ''] },
    ]
    /* if (config.featureFlags.custodyLocationEnabled) {
      summary.push({
        key: 'Location at time of referral',
        lines: [this.personCurrentLocationType ? utils.convertToProperCase(this.personCurrentLocationType) : ''],
      })
      if (this.personCurrentLocationType === 'CUSTODY') {
        summary.push(
          {
            key: 'Current establishment',
            lines: [this.personCustodyPrisonId ? prisonName : ''],
          },
          {
            key: 'Expected release date',
            lines: [this.expectedReleaseDate !== '' ? this.expectedReleaseDate : this.expectedReleaseDateUnKnownReason],
          }
        )
      }
    } */
    summary.push(
      {
        key: 'Address',
        lines: address || ['Not found'],
        listStyle: ListStyle.noMarkers,
      },
      { key: 'Gender', lines: [this.serviceUser.gender ?? ''] },
      { key: 'Ethnicity', lines: [this.serviceUser.ethnicity ?? ''] },
      { key: 'Preferred language', lines: [this.serviceUser.preferredLanguage ?? ''] },
      { key: 'Religion or belief', lines: [this.serviceUser.religionOrBelief ?? ''] },
      { key: 'Disabilities', lines: this.serviceUser.disabilities ?? [], listStyle: ListStyle.noMarkers },
      {
        key: 'Email address',
        lines: email || [],
        listStyle: ListStyle.noMarkers,
      },
      {
        key: phoneNumbers.length > 1 ? 'Phone numbers' : 'Phone number',
        lines: phoneNumbers,
        listStyle: ListStyle.noMarkers,
      }
    )
    // ]
    return summary
  }

  private get dateOfBirth() {
    if (this.serviceUser.dateOfBirth === null) {
      return ''
    }
    return DateUtils.formattedDate(this.serviceUser.dateOfBirth)
  }

  private get dateOfBirthWithShortMonth() {
    if (this.serviceUser.dateOfBirth === null) {
      return ''
    }
    return DateUtils.formattedDate(this.serviceUser.dateOfBirth, { month: 'short' })
  }

  private get age() {
    if (this.serviceUser.dateOfBirth === null) {
      return ''
    }
    return DateUtils.age(this.serviceUser.dateOfBirth)
  }

  private get expectedReleaseDate() {
    if (this.popReleaseDate === null) {
      return ''
    }
    return DateUtils.formattedDate(this.popReleaseDate)
  }

  private get expectedReleaseDateUnKnownReason() {
    if (this.popReleaseDateUnknownReason === null) {
      return ''
    }
    return this.popReleaseDateUnknownReason
  }
}
