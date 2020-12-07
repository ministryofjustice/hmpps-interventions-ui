import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'

export default class ReferralFormView {
  constructor(private readonly presenter: ReferralFormPresenter) {}

  private static helpers = {
    classForStatus(status: ReferralFormStatus): string {
      switch (status) {
        case ReferralFormStatus.NotStarted:
        case ReferralFormStatus.CannotStartYet:
          return 'govuk-tag govuk-tag--grey'
        case ReferralFormStatus.InProgress:
        case ReferralFormStatus.Completed:
          return 'govuk-tag'
        default:
          return ''
      }
    },
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/form',
      {
        presenter: this.presenter,
        ...ReferralFormView.helpers,
      },
    ]
  }
}
