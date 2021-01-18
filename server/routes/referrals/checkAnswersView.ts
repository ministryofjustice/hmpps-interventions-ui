import CheckAnswersPresenter from './checkAnswersPresenter'

export default class CheckAnswersView {
  constructor(private readonly presenter: CheckAnswersPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return ['referrals/checkAnswers', { presenter: this.presenter }]
  }
}
