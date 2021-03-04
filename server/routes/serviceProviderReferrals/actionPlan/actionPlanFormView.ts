import { InputArgs } from '../../../utils/govukFrontendTypes'
import ActionPlanFormPresenter from './actionPlanFormPresenter'
import ServiceUserBannnerPresenter from '../serviceUserBannerPresenter'

export default class ActionPlanFormView {
  constructor(
    private readonly presenter: ActionPlanFormPresenter,
    private readonly serviceUserBannerPresenter: ServiceUserBannnerPresenter
  ) {}

  private get sessionInputArgs(): InputArgs {
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
    }
  }

  get numSessionRenderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/actionPlan/actionPlanSessions',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.serviceUserBannerPresenter.serviceUserNotificationBannerArgs,
        numberOfSessionsInputArgs: this.sessionInputArgs,
      },
    ]
  }
}
