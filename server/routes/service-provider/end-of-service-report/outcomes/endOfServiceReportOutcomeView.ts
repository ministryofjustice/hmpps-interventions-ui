import { RadiosArgs, TextareaArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import EndOfServiceReportOutcomePresenter from './endOfServiceReportOutcomePresenter'

export default class EndOfServiceReportOutcomeView {
  constructor(private readonly presenter: EndOfServiceReportOutcomePresenter) {}

  private readonly achievementLevelRadiosArgs: RadiosArgs = {
    idPrefix: 'achievement-level',
    name: 'achievement-level',
    fieldset: {
      legend: {
        text: this.presenter.text.achievementLevel.label,
      },
      classes: 'govuk-!-margin-top-3',
    },
    items: this.presenter.fields.achievementLevel.values.map(val => ({
      value: val.value,
      text: val.text,
      checked: val.selected,
    })),
    errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.achievementLevel.errorMessage),
  }

  private readonly progressionCommentsTextareaArgs: TextareaArgs = {
    id: 'progression-comments',
    name: 'progression-comments',
    value: this.presenter.fields.progressionComments.value,
    label: {
      text: 'Do you have any further comments about their progression on this outcome?',
    },
  }

  private readonly additionalTaskCommentsTextareaArgs: TextareaArgs = {
    id: 'additional-task-comments',
    name: 'additional-task-comments',
    value: this.presenter.fields.additionalTaskComments.value,
    label: {
      text: 'Is there anything else that needs doing to achieve this outcome?',
    },
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/endOfServiceReport/outcome',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        achievementLevelRadiosArgs: this.achievementLevelRadiosArgs,
        progressionCommentsTextareaArgs: this.progressionCommentsTextareaArgs,
        additionalTaskCommentsTextareaArgs: this.additionalTaskCommentsTextareaArgs,
      },
    ]
  }
}
