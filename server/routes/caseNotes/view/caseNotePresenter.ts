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
    public loggedInUserType: 'service-provider' | 'probation-practitioner',
    private backlinkPageNumber: number | null
  ) {}

  // There is the chance that further case notes are added which pushes the selected case note onto another page.
  // The backlink will now take them to the page they came from, but potentially not the page the case note now lives.
  backLinkHref = `/${this.loggedInUserType}/referrals/${this.caseNote.referralId}/case-notes${
    this.backlinkPageNumber !== null ? `?page=${this.backlinkPageNumber}` : ''
  }`

  readonly caseNoteSummary: CaseNoteSummary = {
    subject: this.caseNote.subject,
    date: DateUtils.formattedDate(this.caseNote.sentAt),
    time: DateUtils.formattedTime(this.caseNote.sentAt),
    from: this.sentByUserName,
    body: this.caseNote.body,
  }
}
