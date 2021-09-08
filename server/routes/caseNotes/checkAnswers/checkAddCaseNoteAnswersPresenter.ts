import { CaseNote } from '../../../models/caseNote'
import DateUtils from '../../../utils/dateUtils'
import UserDetails from '../../../models/hmppsAuth/userDetails'

interface CaseNotesSummary {
  subject: string
  date: string
  time: string
  from: string
  body: string
}

export default class CheckAddCaseNoteAnswersPresenter {
  constructor(
    private referralId: string,
    private draftId: string,
    public loggedInUserType: 'service-provider' | 'probation-practitioner',
    private loggedInUser: UserDetails,
    private caseNote: CaseNote
  ) {}

  backLinkHref = `/${this.loggedInUserType}/referrals/${this.referralId}/add-case-note/${this.draftId}/details`

  submitHref = `/${this.loggedInUserType}/referrals/${this.referralId}/add-case-note/${this.draftId}/submit`

  readonly caseNoteSummary: CaseNotesSummary = {
    subject: this.caseNote.subject,
    date: DateUtils.formattedDate(new Date()),
    time: DateUtils.formattedTime(new Date()),
    from: this.loggedInUser.name,
    body: this.caseNote.body,
  }
}
