import ReferralStartPresenter from './referralStartPresenter'
import viewUtils from '../../../utils/viewUtils'
import { InputArgs } from '../../../utils/govukFrontendTypes'

export default class ReferralStartView {
  constructor(private readonly presenter: ReferralStartPresenter) {}

  private crnInputArgs(): InputArgs {
    return {
      id: 'service-user-crn',
      name: 'service-user-crn',
      label: {
        text: 'The person’s CRN',
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      autocomplete: 'off',
      errorMessage: viewUtils.govukErrorMessage(this.presenter.text.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/start',
      {
        presenter: this.presenter,
        crnInputArgs: this.crnInputArgs(),
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}
