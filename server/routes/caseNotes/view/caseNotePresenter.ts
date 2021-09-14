import { CaseNote } from '../../../models/caseNote'
import DateUtils from '../../../utils/dateUtils'

interface CaseNoteSummary {
  subject: string
  date: string
  time: string
  from: string
  body: string
}

export default class CaseNotePresenter {
  constructor(
    private caseNote: CaseNote,
    private sentByUserName: string,
    public loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {}

  backLinkHref = `/${this.loggedInUserType}/referrals/${this.caseNote.referralId}/case-notes`

  readonly caseNoteSummary: CaseNoteSummary = {
    subject: this.caseNote.subject,
    date: DateUtils.formattedDate(this.caseNote.sentAt),
    time: DateUtils.formattedTime(this.caseNote.sentAt),
    from: this.sentByUserName,
    body: this.caseNote.body,
  }
}
