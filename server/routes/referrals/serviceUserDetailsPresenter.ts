import ServiceUser from '../../models/serviceUser'
import CalendarDay from '../../utils/calendarDay'
import PresenterUtils from '../../utils/presenterUtils'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'

export default class ServiceUserDetailsPresenter {
  constructor(
    private readonly serviceUser: ServiceUser,
    private readonly deliusServiceUserDetails: DeliusServiceUser
  ) {}

  readonly title = `${this.serviceUser.firstName || 'Service user'}'s information`

  get summary(): SummaryListItem[] {
    // required to force type erasure of type null[] from list of (string[] | null[])
    function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
      return value !== null && value !== undefined
    }
    const phoneNumbers: string[] | undefined = this.deliusServiceUserDetails.contactDetails.phoneNumbers
      ?.map(phoneNumber => phoneNumber.number)
      ?.filter(notEmpty)
    const summary = [
      { key: 'CRN', lines: [this.serviceUser.crn] },
      { key: 'Title', lines: [this.serviceUser.title ?? ''] },
      { key: 'First name', lines: [this.serviceUser.firstName ?? ''] },
      { key: 'Last name', lines: [this.serviceUser.lastName ?? ''] },
      { key: 'Date of birth', lines: [this.dateOfBirth] },
      { key: 'Gender', lines: [this.serviceUser.gender ?? ''] },
      { key: 'Ethnicity', lines: [this.serviceUser.ethnicity ?? ''] },
      { key: 'Preferred language', lines: [this.serviceUser.preferredLanguage ?? ''] },
      { key: 'Religion or belief', lines: [this.serviceUser.religionOrBelief ?? ''] },
      { key: 'Disabilities', lines: this.serviceUser.disabilities ?? [], listStyle: ListStyle.noMarkers },
      {
        key: 'Email address',
        lines: this.deliusServiceUserDetails.contactDetails.emailAddresses ?? [],
        listStyle: ListStyle.bulleted,
      },
      {
        key: 'Phone number',
        lines: phoneNumbers ?? [],
        listStyle: ListStyle.bulleted,
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
