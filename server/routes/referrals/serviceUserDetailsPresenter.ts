import ServiceUser from '../../models/serviceUser'
import CalendarDay from '../../utils/calendarDay'
import PresenterUtils from '../../utils/presenterUtils'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import { ExpandedDeliusServiceUser } from '../../models/delius/deliusServiceUser'
import ExpandedDeliusServiceUserDecorator from '../../decorators/expandedDeliusServiceUserDecorator'

export default class ServiceUserDetailsPresenter {
  constructor(
    private readonly serviceUser: ServiceUser,
    private readonly deliusServiceUserDetails: ExpandedDeliusServiceUser
  ) {}

  readonly title = `${this.serviceUser.firstName || 'Service user'}'s information`

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
    const summary = [
      { key: 'CRN', lines: [this.serviceUser.crn] },
      { key: 'Title', lines: [this.serviceUser.title ?? ''] },
      { key: 'First name', lines: [this.serviceUser.firstName ?? ''] },
      { key: 'Last name', lines: [this.serviceUser.lastName ?? ''] },
      { key: 'Date of birth', lines: [this.dateOfBirth] },
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
      },
    ]
    return summary
  }

  private get dateOfBirth() {
    if (this.serviceUser.dateOfBirth === null) {
      return ''
    }

    const day = CalendarDay.parseIso8601Date(this.serviceUser.dateOfBirth)

    if (day === null) {
      return ''
    }

    return PresenterUtils.govukFormattedDate(day)
  }
}
