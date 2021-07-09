import InitialAssessmentFeedbackConfirmationPresenter from './initialAssessmentFeedbackConfirmationPresenter'

export default class InitialAssessmentFeedbackConfirmationView {
  constructor(private readonly presenter: InitialAssessmentFeedbackConfirmationPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/initialAssessmentFeedbackConfirmation',
      {
        presenter: this.presenter,
      },
    ]
  }
}
