import ServiceUser from '../../../models/serviceUser'
import { ListStyle, SummaryListItem } from '../../../utils/summaryList'
import { ExpandedDeliusServiceUser } from '../../../models/delius/deliusServiceUser'
import ExpandedDeliusServiceUserDecorator from '../../../decorators/expandedDeliusServiceUserDecorator'
import DateUtils from '../../../utils/dateUtils'
import config from '../../../config'

export default class ServiceUserDetailsPresenter {
  constructor(
    private readonly serviceUser: ServiceUser,
    private readonly deliusServiceUserDetails: ExpandedDeliusServiceUser,
    private readonly personCurrentLocationType: CurrentLocationType | null = null,
    private readonly personCustodyPrisonId: string | null = null
  ) {}

  readonly title = `${this.serviceUser.firstName || 'The person on probation'}'s information`

  // required to force type erasure of type null[] from list of (string[] | null[])
  private notEmpty(value: string | null | undefined): value is string {
    return value !== null && value !== undefined
  }

  private findUniqueNumbers(): string[] {
    let phoneNumbers: string[] | undefined = this.deliusServiceUserDetails.contactDetails.phoneNumbers
      ?.map(phoneNumber => phoneNumber.number)
      ?.filter(this.notEmpty)
    // only unique
    phoneNumbers = phoneNumbers?.filter((item, pos) => {
      return phoneNumbers?.indexOf(item) === pos
    })
    return phoneNumbers ?? []
  }

  get summary(): SummaryListItem[] {
    const emails = this.deliusServiceUserDetails.contactDetails.emailAddresses ?? []
    const phoneNumbers = this.findUniqueNumbers()
    const { address } = new ExpandedDeliusServiceUserDecorator(this.deliusServiceUserDetails)
    const summary: SummaryListItem[] = [
      { key: 'CRN', lines: [this.serviceUser.crn] },
      { key: 'Title', lines: [this.serviceUser.title ?? ''] },
      { key: 'First name', lines: [this.serviceUser.firstName ?? ''] },
      { key: 'Last name', lines: [this.serviceUser.lastName ?? ''] },
      { key: 'Date of birth', lines: [this.dateOfBirth] },
    ]
    if (config.featureFlags.custodyLocationEnabled) {
      summary.push({
        key: 'Location at time of referral',
        lines: [this.personCurrentLocationType ? this.personCurrentLocationType : ''],
      })
      if (this.personCurrentLocationType === 'CUSTODY') {
        summary.push(
          {
            key: 'Current Establishment',
            lines: [this.personCustodyPrisonId ? this.personCustodyPrisonId : ''],
          }
          // {
          //   key: 'Expected release date',
          //   lines: [this.referral?.personCurrentLocationType ? this.referral?.personCurrentLocationType : ''],
          // }
        )
      }
    }
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
        key: emails.length > 1 ? 'Email addresses' : 'Email address',
        lines: emails,
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
}
