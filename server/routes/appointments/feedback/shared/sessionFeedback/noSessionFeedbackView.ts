import { BackLinkArgs, ErrorSummaryArgs, TextareaArgs } from '../../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../../utils/viewUtils'
import SessionFeedbackInputsPresenter from './sessionFeedbackInputsPresenter'
import ActionPlanNoSessionFeedbackPresenter from '../../actionPlanSessions/sessionFeedback/actionPlanNoSessionFeedbackPresenter'
import InitialAssessmentNoSessionFeedbackPresenter from '../../initialAssessment/initialAssessmentNoSessionFeedbackPresenter'

export default class NoSessionFeedbackView {
  inputsPresenter: SessionFeedbackInputsPresenter

  constructor(
    private readonly presenter: ActionPlanNoSessionFeedbackPresenter | InitialAssessmentNoSessionFeedbackPresenter
  ) {
    this.inputsPresenter = this.presenter.inputsPresenter
  }

  private get errorSummaryArgs(): ErrorSummaryArgs | null {
    return ViewUtils.govukErrorSummaryArgs(this.inputsPresenter.errorSummary)
  }

  private notifyPPRadioButtonArgs(yesHtml: string): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'notify-probation-practitioner',
      name: 'notify-probation-practitioner',
      fieldset: {
        legend: {
          html: `<label class=govuk-fieldset__legend--m> ${ViewUtils.escape(
            this.presenter.questionnaire.notifyProbationPractitionerQuestion.text
          )}</label><p class="govuk-inset-text">${ViewUtils.escape(
            this.presenter.questionnaire.notifyProbationPractitionerQuestion.explanation
          )}</p>`,
          isPageHeading: false,
        },
      },
      items: [
        {
          id: 'yesNotifyPPRadio',
          value: 'yes',
          text: 'Yes',
          checked: this.inputsPresenter.fields.notifyProbationPractitioner.value === true,
          conditional: {
            html: yesHtml,
          },
        },
        {
          id: 'noNotifyPPRadio',
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

  private noSessionReasonButtonArgs(
    popUnacceptableHtml: string,
    popAcceptableHtml: string,
    logisticsHtml: string
  ): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'no-session-reason-type',
      name: 'no-session-reason-type',
      attributes: { 'data-cy': 'why-did-session-not-happen-radios' },
      fieldset: {
        legend: {
          text: this.presenter.questionnaire.noSessionReasonQuestion.text,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.noSessionReasonType.errorMessage),
      items: [
        {
          value: this.presenter.fieldText.popUnacceptable.value,
          text: this.presenter.fieldText.popUnacceptable.text,
          checked: this.inputsPresenter.fields.noSessionReasonType.value === 'POP_UNACCEPTABLE',
          conditional: {
            html: popUnacceptableHtml,
          },
        },
        {
          value: this.presenter.fieldText.popAcceptable.value,
          text: this.presenter.fieldText.popAcceptable.text,
          checked: this.inputsPresenter.fields.noSessionReasonType.value === 'POP_ACCEPTABLE',
          conditional: {
            html: popAcceptableHtml,
          },
        },
        {
          value: this.presenter.fieldText.logistics.value,
          text: this.presenter.fieldText.logistics.text,
          checked: this.inputsPresenter.fields.noSessionReasonType.value === 'LOGISTICS',
          conditional: {
            html: logisticsHtml,
          },
        },
      ],
    }
  }

  private get popAcceptableAdditionalInformationTextAreaArgs(): TextareaArgs {
    return {
      name: 'no-session-reason-pop-acceptable',
      id: 'no-session-reason-pop-acceptable',
      label: {
        text: this.presenter.questionnaire.noSessionReasonAdditionalInformationPOPAcceptableQuestion.text,
        classes: 'govuk-body govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      value: this.inputsPresenter.fields.noSessionReasonPopAcceptable.value,
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.noSessionReasonPopAcceptable.errorMessage),
    }
  }

  private get popUnacceptableAdditionalInformationTextAreaArgs(): TextareaArgs {
    return {
      name: 'no-session-reason-pop-unacceptable',
      id: 'no-session-reason-pop-unacceptable',
      label: {
        text: this.presenter.questionnaire.noSessionReasonAdditionalInformationPOPUnacceptableQuestion.text,
        classes: 'govuk-body govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      value: this.inputsPresenter.fields.noSessionReasonPopAcceptable.value,
      errorMessage: ViewUtils.govukErrorMessage(
        this.inputsPresenter.fields.noSessionReasonPopUnacceptable.errorMessage
      ),
    }
  }

  private get logisticsAdditionalInformationTextAreaArgs(): TextareaArgs {
    return {
      name: 'no-session-reason-logistics',
      id: 'no-session-reason-logistics',
      label: {
        text: this.presenter.questionnaire.noSessionReasonAdditionalInformationLogisticsQuestion.text,
        classes: 'govuk-body govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      value: this.inputsPresenter.fields.noSessionReasonLogistics.value,
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.noSessionReasonLogistics.errorMessage),
    }
  }

  private get rescheduleSessionRadioArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'reschedule-session-radio',
      name: 'reschedule-session',
      attributes: { 'data-cy': 'reschedule-session-radios' },
      fieldset: {
        legend: {
          text: this.presenter.questionnaire.rescheduleSessionQuestion.text,
          isPageHeading: false,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      hint: {
        text: this.presenter.questionnaire.rescheduleSessionQuestion.hint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.rescheduleSession.errorMessage),
      items: [
        {
          value: 'Yes',
          text: 'Yes',
          // checked: this.inputsPresenter.fields.noSessionReason.value === true,
        },
        {
          value: 'No',
          text: 'No',
          // checked: this.inputsPresenter.fields.noSessionReason.value === false,
        },
      ],
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

  private get noAttendanceInformationTextAreaArgs(): TextareaArgs {
    return {
      name: 'no-attendance-information',
      id: 'no-attendance-information',
      label: {
        text: this.presenter.questionnaire.noAttendanceInformationQuestion.text,
        classes: 'govuk-label--m govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      value: this.inputsPresenter.fields.noAttendanceInformation.value,
      errorMessage: ViewUtils.govukErrorMessage(this.inputsPresenter.fields.noAttendanceInformation.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    if (this.presenter.attended === 'yes') {
      return this.sessionAttendedArgs
    }
    return this.sessionNotAttendedArgs
  }

  get sessionAttendedArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionFeedbackNoSessionYesAttended',
      {
        presenter: this.presenter,
        radioButtonArgs: this.notifyPPRadioButtonArgs.bind(this),
        sessionConcernsTextAreaArgs: this.sessionConcernsTextAreaArgs,
        noSessionReasonButtonArgs: this.noSessionReasonButtonArgs.bind(this),
        popAcceptableAdditionalInformationTextAreaArgs: this.popAcceptableAdditionalInformationTextAreaArgs,
        popUnacceptableAdditionalInformationTextAreaArgs: this.popUnacceptableAdditionalInformationTextAreaArgs,
        logisticsAdditionalInformationTextAreaArgs: this.logisticsAdditionalInformationTextAreaArgs,
        rescheduleSessionRadioArgs: this.rescheduleSessionRadioArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }

  get sessionNotAttendedArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/shared/postSessionFeedbackNoSessionNoAttended',
      {
        presenter: this.presenter,
        radioButtonArgs: this.notifyPPRadioButtonArgs.bind(this),
        sessionConcernsTextAreaArgs: this.sessionConcernsTextAreaArgs,
        noAttendanceInformationTextAreaArgs: this.noAttendanceInformationTextAreaArgs,
        rescheduleSessionRadioArgs: this.rescheduleSessionRadioArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
