import { InputArgs } from '../../../../utils/govukFrontendTypes'
import ActionPlanNumberOfSessionsPresenter from './actionPlanNumberOfSessionsPresenter'
import ViewUtils from '../../../../utils/viewUtils'

export default class ActionPlanNumberOfSessionsView {
  constructor(private readonly presenter: ActionPlanNumberOfSessionsPresenter) {}

  private get numberOfSessionsInputArgs(): InputArgs {
    return {
      label: {
        text: 'Number of sessions',
      },
      classes: 'govuk-input--width-2',
      id: 'number-of-sessions',
      name: 'number-of-sessions',
      inputmode: 'numeric',
      pattern: '[0-9]*',
      spellcheck: false,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.numberOfSessions.errorMessage),
      value: this.presenter.fields.numberOfSessions,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/actionPlan/numberOfSessions',
      {
        presenter: this.presenter,
        errorSummaryArgs: ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary),
        numberOfSessionsInputArgs: this.numberOfSessionsInputArgs,
      },
    ]
  }
}
