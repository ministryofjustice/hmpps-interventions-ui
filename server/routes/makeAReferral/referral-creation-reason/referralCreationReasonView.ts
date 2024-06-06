import { TextareaArgs } from '../../../utils/govukFrontendTypes'
import ReferralCreationReasonPresenter from './referralCreationReasonPresenter'

export default class ReferralCreationReasonView {
  constructor(private readonly presenter: ReferralCreationReasonPresenter) {}

  private get reasonForReferralCreationBeforeAllocationReasonArgs(): TextareaArgs {
    return {
      id: 'referral-creation-reason-before-allocation',
      name: 'referral-creation-reason-before-allocation',
      label: {},
      value: this.presenter.fields.referralCreationReasonBeforeAllocation,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/referralCreationReasonBeforeAllocation',
      {
        presenter: this.presenter,
        reasonForReferralCreationBeforeAllocationReasonArgs: this.reasonForReferralCreationBeforeAllocationReasonArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
