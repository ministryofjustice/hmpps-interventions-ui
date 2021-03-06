import { DraftReferral, ServiceCategory } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import ReferralDataPresenterUtils from './referralDataPresenterUtils'

export default class RarDaysPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly errorSummary = ReferralDataPresenterUtils.errorSummary(this.error, {
    fieldOrder: ['using-rar-days', 'maximum-rar-days'],
  })

  readonly text = {
    title: `Are you using RAR days for the ${this.serviceCategory.name} service?`,
    usingRarDays: {
      errorMessage: ReferralDataPresenterUtils.errorMessage(this.error, 'using-rar-days'),
    },
    maximumRarDays: {
      label: `What is the maximum number of RAR days for the ${this.serviceCategory.name} service?`,
      errorMessage: ReferralDataPresenterUtils.errorMessage(this.error, 'maximum-rar-days'),
    },
  }

  private readonly utils = new ReferralDataPresenterUtils(this.referral, this.userInputData)

  readonly fields = {
    usingRarDays: this.utils.booleanValue('usingRarDays', 'using-rar-days'),
    maximumRarDays: this.utils.stringValue('maximumRarDays', 'maximum-rar-days'),
  }
}
