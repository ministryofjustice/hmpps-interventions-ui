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
      text: 'Describe their progress on this outcome',
    },
    errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.progressionComments.errorMessage),
  }

  private readonly additionalTaskCommentsTextareaArgs: TextareaArgs = {
    id: 'additional-task-comments',
    name: 'additional-task-comments',
    value: this.presenter.fields.additionalTaskComments.value,
    label: {
      text: 'Enter if anything else needs to be done (optional)',
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
