import { PanelArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import ConfirmationPresenter from './confirmationPresenter'

export default class ConfirmationView {
  constructor(private readonly presenter: ConfirmationPresenter) {}

  private readonly panelArgs: PanelArgs = {
    titleText: this.presenter.text.title,
    html: `${ViewUtils.escape(this.presenter.text.referenceNumberIntro)}<br><strong>${ViewUtils.escape(
      this.presenter.text.referenceNumber
    )}</strong>`,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/confirmation',
      {
        presenter: this.presenter,
        panelArgs: this.panelArgs,
      },
    ]
  }
}
