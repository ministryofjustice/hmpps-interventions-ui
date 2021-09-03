import { Page } from '../../models/pagination'
import { CaseNote } from '../../models/caseNote'
import Pagination from '../../utils/pagination/pagination'
import DateUtils from '../../utils/dateUtils'

interface CaseNotesTableRow {
  sentAtDay: string
  sentAtDate: string
  sentAtTime: string
  sentBy: string
  subject: string
  body: string
}

export default class CaseNotesPresenter {
  public readonly pagination: Pagination

  constructor(private caseNotes: Page<CaseNote>) {
    this.pagination = new Pagination(caseNotes)
  }

  readonly tableHeadings: string[] = ['Details', 'Case notes']

  readonly tableRows: CaseNotesTableRow[] = this.caseNotes.content.map(caseNote => {
    return {
      sentAtDay: DateUtils.formattedDayOfWeek(caseNote.sentAt),
      sentAtDate: DateUtils.formattedDate(caseNote.sentAt),
      sentAtTime: DateUtils.formattedTime(caseNote.sentAt),
      sentBy: caseNote.sentBy.username,
      subject: caseNote.subject,
      body: caseNote.body,
    }
  })
}
