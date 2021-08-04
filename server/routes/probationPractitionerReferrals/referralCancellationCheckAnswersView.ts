import ReferralCancellationCheckAnswersPresenter from './referralCancellationCheckAnswersPresenter'

export default class ReferralCancellationCheckAnswersView {
  constructor(private readonly presenter: ReferralCancellationCheckAnswersPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellationCheckAnswers',
      {
        presenter: this.presenter,
      },
    ]
  }
}
