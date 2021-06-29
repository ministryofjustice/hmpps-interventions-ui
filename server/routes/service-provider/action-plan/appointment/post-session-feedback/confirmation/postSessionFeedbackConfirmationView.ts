import PostSessionFeedbackConfirmationPresenter from './postSessionFeedbackConfirmationPresenter'

export default class PostSessionFeedbackConfirmationView {
  constructor(private readonly presenter: PostSessionFeedbackConfirmationPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionFeedbackConfirmation',
      {
        presenter: this.presenter,
      },
    ]
  }
}
