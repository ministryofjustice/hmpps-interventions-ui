import { TextareaArgs } from '../../utils/govukFrontendTypes'
import ReferralCancellationPresenter from './referralCancellationPresenter'

export default class ReferralCancellationView {
  constructor(private readonly presenter: ReferralCancellationPresenter) {}

  private get additionalCommentsTextareaArgs(): TextareaArgs {
    return {
      id: 'progression-comments',
      name: 'progression-comments',
      label: {
        text: this.presenter.text.additionalCommentsLabel,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralCancellation',
      {
        presenter: this.presenter,
        additionalCommentsTextareaArgs: this.additionalCommentsTextareaArgs,
      },
    ]
  }
}
