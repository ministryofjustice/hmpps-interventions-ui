import { ErrorSummaryArgs, TextareaArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import BehaviourFeedbackInputsPresenter from './behaviourFeedbackInputsPresenter'
import { BehaviourFeedbackPresenter } from './behaviourFeedbackPresenter'

export default class BehaviourFeedbackView {
  inputsPresenter: BehaviourFeedbackInputsPresenter

  constructor(private readonly presenter: BehaviourFeedbackPresenter) {
    this.inputsPresenter = this.presenter.inputsPresenter
  }

  private get errorSummaryArgs(): ErrorSummaryArgs | null {
    return ViewUtils.govukErrorSummaryArgs(this.inputsPresenter.errorSummary)
  }

  private get textAreaArgs(): TextareaArgs {
    return {
      name: 'behaviour-description',
      id: 'behaviour-description',
      label: {
        text: this.presenter.text.behaviourDescription.question,
        classes: 'govuk-label--m govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      hint: {
        text: this.presenter.text.behaviourDescription.hint,
      },
      value: this.inputsPresenter.fields.behaviourDescription.value,
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.behaviourDescription.errorMessage),
    }
  }

  private get radioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'notify-probation-practitioner',
      name: 'notify-probation-practitioner',
      fieldset: {
        legend: {
          html: `<h2 class=govuk-fieldset__legend--m>${ViewUtils.escape(
            this.presenter.text.notifyProbationPractitioner.question
          )}</h2><p class="govuk-body--m">${ViewUtils.escape(
            this.presenter.text.notifyProbationPractitioner.explanation
          )}</p>`,
          isPageHeading: false,
        },
      },
      hint: {
        text: this.presenter.text.notifyProbationPractitioner.hint,
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.inputsPresenter.fields.notifyProbationPractitioner.value === true,
        },
        {
          value: 'no',
          text: 'No',
          checked: this.inputsPresenter.fields.notifyProbationPractitioner.value === false,
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.notifyProbationPractitioner.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionBehaviourFeedback',
      {
        presenter: this.presenter,
        textAreaArgs: this.textAreaArgs,
        radioButtonArgs: this.radioButtonArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}
