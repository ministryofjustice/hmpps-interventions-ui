import PostSessionFeedbackConfirmationPresenter from './postSessionFeedbackConfirmationPresenter'

export default class PostSessionFeedbackConfirmationView {
  constructor(private readonly presenter: PostSessionFeedbackConfirmationPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'appointments/feedback/actionPlanSessions/postSessionFeedbackConfirmation',
      {
        presenter: this.presenter,
      },
    ]
  }
}
