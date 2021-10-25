import AddCaseNotePresenter from './addCaseNotePresenter'
import { DetailsArgs, InputArgs } from '../../../utils/govukFrontendTypes'
import AddNewCaseNoteForm from './AddNewCaseNoteForm'
import ViewUtils from '../../../utils/viewUtils'

export default class AddCaseNoteView {
  constructor(private presenter: AddCaseNotePresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.backLinkHref,
  }

  private get subjectInputArgs(): InputArgs {
    return {
      label: {
        text: 'Subject',
        classes: 'govuk-label--s',
      },
      id: AddNewCaseNoteForm.caseNoteSubjectFormId,
      name: AddNewCaseNoteForm.caseNoteSubjectFormId,
      value: this.presenter.fields.subject.value,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.subject.errorMessage),
    }
  }

  private get bodyInputArgs(): InputArgs {
    return {
      label: {
        text: 'Add notes about this intervention or service user',
        classes: 'govuk-label--s',
      },
      id: AddNewCaseNoteForm.caseNoteBodyFormId,
      name: AddNewCaseNoteForm.caseNoteBodyFormId,
      value: this.presenter.fields.body.value,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.body.errorMessage),
    }
  }

  private get detailsArgs(): DetailsArgs {
    return {
      summaryText: 'What should go in a case note',
      html: `<p class="govuk-body">Case notes are for anything outside of scheduled sessions, such as phone calls or unplanned appointments.</p>
        <p class="govuk-body">If the person is moving between prisons or being released, add which prison, where they’ll be released to and when.</p>
        <p class="govuk-body">Anything urgent or important needs to be followed up between the service provider and probation practitioner.</p>`,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'caseNotes/addNewCaseNote',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        subjectInputArgs: this.subjectInputArgs,
        bodyInputArgs: this.bodyInputArgs,
        detailsArgs: this.detailsArgs,
      },
    ]
  }
}
