import { BackLinkArgs, ErrorSummaryArgs, TextareaArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import SessionFeedbackInputsPresenter from './sessionFeedbackInputsPresenter'
import { SessionFeedbackPresenter } from './sessionFeedbackPresenter'

export default class SessionFeedbackView {
  inputsPresenter: SessionFeedbackInputsPresenter

  constructor(private readonly presenter: SessionFeedbackPresenter) {
    this.inputsPresenter = this.presenter.inputsPresenter
  }

  private get errorSummaryArgs(): ErrorSummaryArgs | null {
    return ViewUtils.govukErrorSummaryArgs(this.inputsPresenter.errorSummary)
  }

  private get sessionSummaryTextAreaArgs(): TextareaArgs {
    return {
      name: 'session-summary',
      id: 'session-summary',
      label: {
        text: this.presenter.questionnaire.sessionSummaryQuestion.text,
        classes: 'govuk-label--m govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      hint: {
        text: this.presenter.questionnaire.sessionSummaryQuestion.hint,
      },
      value: this.inputsPresenter.fields.sessionSummary.value,
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.sessionSummary.errorMessage),
    }
  }

  private get sessionResponseTextAreaArgs(): TextareaArgs {
    return {
      name: 'session-response',
      id: 'session-response',
      label: {
        text: this.presenter.questionnaire.sessionResponseQuestion.text,
        classes: 'govuk-label--m govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      hint: {
        text: this.presenter.questionnaire.sessionResponseQuestion.hint,
      },
      value: this.inputsPresenter.fields.sessionResponse.value,
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.sessionResponse.errorMessage),
    }
  }

  private get sessionConcernsTextAreaArgs(): TextareaArgs {
    return {
      name: 'session-concerns',
      id: 'session-concerns',
      label: {
        text: this.presenter.questionnaire.sessionConcernsQuestion.text,
        classes: 'govuk-body govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      value: this.inputsPresenter.fields.sessionConcerns.value,
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.sessionConcerns.errorMessage),
    }
  }

  private radioButtonArgs(yesHtml: string): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'notify-probation-practitioner',
      name: 'notify-probation-practitioner',
      fieldset: {
        legend: {
          html: `<h2 class=govuk-fieldset__legend--m>${ViewUtils.escape(
            this.presenter.questionnaire.notifyProbationPractitionerQuestion.text
          )}</h2><p class="govuk-inset-text">${ViewUtils.escape(
            this.presenter.questionnaire.notifyProbationPractitionerQuestion.explanation
          )}</p>`,
          isPageHeading: false,
        },
      },
      // hint: {
      //   text: this.presenter.questionnaire.notifyProbationPractitionerQuestion.hint,
      // },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.inputsPresenter.fields.notifyProbationPractitioner.value === true,
          conditional: {
            html: yesHtml,
          },
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

  get backLinkArgs(): BackLinkArgs | null {
    if (!this.presenter.backLinkHref) {
      return null
    }

    return {
      href: this.presenter.backLinkHref,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionFeedback',
      {
        presenter: this.presenter,
        sessionSummaryTextAreaArgs: this.sessionSummaryTextAreaArgs,
        sessionResponseTextAreaArgs: this.sessionResponseTextAreaArgs,
        sessionConcernsTextAreaArgs: this.sessionConcernsTextAreaArgs,
        radioButtonArgs: this.radioButtonArgs.bind(this),
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
