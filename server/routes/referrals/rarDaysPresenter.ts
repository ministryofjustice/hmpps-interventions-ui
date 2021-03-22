import { DraftReferral, ServiceCategory } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class RarDaysPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['using-rar-days', 'maximum-rar-days'],
  })

  readonly text = {
    title: `Are you using RAR days for the ${this.serviceCategory.name} service?`,
    usingRarDays: {
      errorMessage: PresenterUtils.errorMessage(this.error, 'using-rar-days'),
    },
    maximumRarDays: {
      label: `What is the maximum number of RAR days for the ${this.serviceCategory.name} service?`,
      errorMessage: PresenterUtils.errorMessage(this.error, 'maximum-rar-days'),
    },
  }

  private readonly utils = new PresenterUtils(this.referral, this.userInputData)

  readonly fields = {
    usingRarDays: this.utils.booleanValue('usingRarDays', 'using-rar-days'),
    maximumRarDays: this.utils.stringValue('maximumRarDays', 'maximum-rar-days'),
  }
}
