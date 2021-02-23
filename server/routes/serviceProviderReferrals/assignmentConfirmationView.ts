import AssignmentConfirmationPresenter from './assignmentConfirmationPresenter'
import ViewUtils from '../../utils/viewUtils'
import { PanelArgs } from '../../utils/govukFrontendTypes'

export default class AssignmentConfirmationView {
  constructor(private readonly presenter: AssignmentConfirmationPresenter) {}

  private readonly summaryListArgs = ViewUtils.summaryListArgs(this.presenter.summary)

  private readonly panelArgs: PanelArgs = {
    titleText: 'Caseworker assigned',
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/assignmentConfirmation',
      { presenter: this.presenter, summaryListArgs: this.summaryListArgs, panelArgs: this.panelArgs },
    ]
  }
}
