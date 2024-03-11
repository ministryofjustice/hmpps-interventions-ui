import { CaseNote } from '../../../../models/caseNote'
import DateUtils from '../../../../utils/dateUtils'
import UserDetails from '../../../../models/hmppsAuth/userDetails'

interface CaseNotesSummary {
  subject: string
  date: string
  time: string
  from: string
  body: string
  sendEmail: string
}

export default class AddCaseNoteCheckAnswersPresenter {
  constructor(
    private referralId: string,
    private draftId: string,
    public loggedInUserType: 'service-provider' | 'probation-practitioner',
    private loggedInUser: UserDetails,
    private caseNote: CaseNote
  ) {}

  readonly caseNoteDetailsHeading = 'Case note details'

  backLinkHref = `/${this.loggedInUserType}/referrals/${this.referralId}/add-case-note/${this.draftId}/details`

  submitHref = `/${this.loggedInUserType}/referrals/${this.referralId}/add-case-note/${this.draftId}/submit`

  readonly caseNoteSummary: CaseNotesSummary = {
    subject: this.caseNote.subject,
    date: DateUtils.formattedDate(new Date()),
    time: DateUtils.formattedTime(new Date()),
    from: this.loggedInUser.name,
    body: this.caseNote.body,
    sendEmail: String(this.caseNote.sendEmail) === 'true' ? 'Yes' : 'No',
  }
}
