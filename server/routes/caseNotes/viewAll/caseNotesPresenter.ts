import { Page } from '../../../models/pagination'
import { CaseNote } from '../../../models/caseNote'
import Pagination from '../../../utils/pagination/pagination'
import DateUtils from '../../../utils/dateUtils'
import utils from '../../../utils/utils'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../../shared/referralOverviewPagePresenter'
import Intervention from '../../../models/intervention'

interface CaseNotesTableRow {
  sentAtDay: string
  sentAtDate: string
  sentAtTime: string
  sentBy: string
  sentByUserType: 'probation practitioner' | 'service provider'
  subject: string
  body: string
  caseNoteLink: string
}

export default class CaseNotesPresenter {
  public readonly pagination: Pagination

  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private referralId: string,
    private intervention: Intervention,
    private caseNotes: Page<CaseNote>,
    private officerUserNameMapping: Map<string, undefined | string>,
    private serviceUser: DeliusServiceUser,
    public loggedInUserType: 'service-provider' | 'probation-practitioner',
    private readonly dashboardOriginPage?: string
  ) {
    this.pagination = new Pagination(caseNotes)
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.CaseNotes,
      referralId,
      loggedInUserType
    )
  }

  readonly text = {
    title: `${utils.convertToTitleCase(this.intervention.contractType.name)}: case notes`,
  }

  readonly backlinkPageNumber = this.caseNotes.number + 1

  readonly hrefBackLink = this.dashboardOriginPage || `/${this.loggedInUserType}/dashboard`

  readonly hrefCaseNoteStart = `/${this.loggedInUserType}/referrals/${this.referralId}/add-case-note/start`

  readonly serviceUserName = utils.convertToTitleCase(
    `${this.serviceUser.name.forename} ${this.serviceUser.name.surname}`
  )

  readonly tableHeadings: string[] = ['Details', 'Case notes']

  readonly tableRows: CaseNotesTableRow[] = this.caseNotes.content.map(caseNote => {
    const matchedOfficer = this.officerUserNameMapping.get(caseNote.sentBy.username)
    let officerName = caseNote.sentBy.username
    if (matchedOfficer) {
      officerName = matchedOfficer
    }
    return {
      sentAtDay: DateUtils.formattedDayOfWeek(caseNote.sentAt),
      sentAtDate: DateUtils.formattedDate(caseNote.sentAt),
      sentAtTime: DateUtils.formattedTime(caseNote.sentAt),
      sentBy: officerName,
      sentByUserType: caseNote.sentBy.authSource === 'delius' ? 'probation practitioner' : 'service provider',
      subject: caseNote.subject,
      body: caseNote.body,
      caseNoteLink: `/${this.loggedInUserType}/case-note/${caseNote.id}?backlinkPageNumber=${this.backlinkPageNumber}`,
    }
  })
}
