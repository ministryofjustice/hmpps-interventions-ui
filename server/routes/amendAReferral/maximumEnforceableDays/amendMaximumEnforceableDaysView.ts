import ViewUtils from '../../../utils/viewUtils'
import { TextareaArgs } from '../../../utils/govukFrontendTypes'
import AmendMaximumEnforceableDaysPresenter from './amendMaximumEnforceableDaysPresenter'
import EnforceableDaysView from '../../makeAReferral/enforceable-days/enforceableDaysView'
import AmendMaximumEnforceableDaysForm from './amendMaximumEnforceableDaysForm'

export default class AmendMaximumEnforceableDaysView {
  private enforceableDaysView: EnforceableDaysView

  constructor(private readonly presenter: AmendMaximumEnforceableDaysPresenter) {
    this.enforceableDaysView = new EnforceableDaysView(presenter.enforceableDaysPresenter)
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get textAreaArgs(): TextareaArgs {
    return {
      name: AmendMaximumEnforceableDaysForm.reasonForChangeId,
      id: AmendMaximumEnforceableDaysForm.reasonForChangeId,
      label: {
        text: this.presenter.title,
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      value: this.presenter.fields.reasonForChange as string,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/enforceableDays',
      {
        presenter: this.presenter,
        maximumEnforceableDaysInputArgs: this.enforceableDaysView.renderArgs[1].maximumEnforceableDaysInputArgs,
        reasonForChangeInputArgs: this.textAreaArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}
