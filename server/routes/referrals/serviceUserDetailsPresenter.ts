import { ServiceUser } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'

export default class ServiceUserDetailsPresenter {
  constructor(private readonly serviceUser: ServiceUser) {}

  readonly title = `${this.serviceUser.firstName || 'Service user'}'s information`

  readonly summary: SummaryListItem[] = [
    { key: 'CRN', lines: [this.serviceUser.crn], isList: false },
    { key: 'Title', lines: [this.serviceUser.title ?? ''], isList: false },
    { key: 'First name', lines: [this.serviceUser.firstName ?? ''], isList: false },
    { key: 'Last name', lines: [this.serviceUser.lastName ?? ''], isList: false },
    { key: 'Date of birth', lines: [this.serviceUser.dateOfBirth ?? ''], isList: false },
    { key: 'Gender', lines: [this.serviceUser.gender ?? ''], isList: false },
    { key: 'Ethnicity', lines: [this.serviceUser.ethnicity ?? ''], isList: false },
    { key: 'Preferred language', lines: [this.serviceUser.preferredLanguage ?? ''], isList: false },
    { key: 'Religion or belief', lines: [this.serviceUser.religionOrBelief ?? ''], isList: false },
    { key: 'Disabilities', lines: this.serviceUser.disabilities ?? [], isList: true },
  ]
}
