import { InputArgs } from '../../../utils/govukFrontendTypes'
import ServiceUserBannnerPresenter from '../serviceUserBannerPresenter'
import AddActionPlanNumberOfSessionsPresenter from './addActionPlanNumberOfSessionsPresenter'
import ViewUtils from '../../../utils/viewUtils'

export default class AddActionPlanNumberOfSessionsView {
  constructor(
    private readonly serviceUserBannerPresenter: ServiceUserBannnerPresenter,
    private readonly presenter: AddActionPlanNumberOfSessionsPresenter
  ) {}

  private get numberOfSessionsInputArgs(): InputArgs {
    return {
      label: {
        text: 'Number of sessions',
      },
      classes: 'govuk-input--width-2',
      id: 'numberOfSessions',
      name: 'numberOfSessions',
      inputmode: 'numeric',
      pattern: '[0-9]*',
      spellcheck: false,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/actionPlan/addNumberOfSessions',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.serviceUserBannerPresenter.serviceUserNotificationBannerArgs,
        numberOfSessionsInputArgs: this.numberOfSessionsInputArgs,
      },
    ]
  }
}
