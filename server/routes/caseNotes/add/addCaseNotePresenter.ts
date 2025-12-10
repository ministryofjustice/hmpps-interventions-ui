import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import AddNewCaseNoteForm from './AddNewCaseNoteForm'
import { CaseNote } from '../../../models/caseNote'

export default class AddCaseNotePresenter {
  private formError: FormValidationError | null

  constructor(
    private referralId: string,
    public loggedInUserType: 'service-provider' | 'probation-practitioner',
    private readonly caseNote: CaseNote | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.formError = error
  }

  backLinkHref = `/${this.loggedInUserType}/referrals/${this.referralId}/case-notes`

  private readonly presenterUtils = new PresenterUtils(this.userInputData)

  readonly fields = {
    subject: {
      value: this.presenterUtils.stringValue(
        this.caseNote ? this.caseNote.subject : null,
        AddNewCaseNoteForm.caseNoteSubjectFormId
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, AddNewCaseNoteForm.caseNoteSubjectFormId),
    },
    body: {
      value: this.presenterUtils.stringValue(
        this.caseNote ? this.caseNote.body : null,
        AddNewCaseNoteForm.caseNoteBodyFormId
      ),
      errorMessage: PresenterUtils.errorMessage(this.error, AddNewCaseNoteForm.caseNoteBodyFormId),
    },
    sendCaseNoteEmail: {
      errorMessage: PresenterUtils.errorMessage(this.error, AddNewCaseNoteForm.sendCaseNoteEmailId),
    },
  }
}
