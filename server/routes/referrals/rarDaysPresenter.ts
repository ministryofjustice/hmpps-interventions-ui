import DraftReferral from '../../models/draftReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import Intervention from '../../models/intervention'
import utils from '../../utils/utils'

export default class RarDaysPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['using-rar-days', 'maximum-rar-days'],
  })

  readonly text = {
    title: `Are you using RAR days for the ${utils.convertToProperCase(this.intervention.contractType.name)} referral?`,
    usingRarDays: {
      errorMessage: PresenterUtils.errorMessage(this.error, 'using-rar-days'),
    },
    maximumRarDays: {
      label: `What is the maximum number of RAR days for the ${utils.convertToProperCase(
        this.intervention.contractType.name
      )} referral?`,
      errorMessage: PresenterUtils.errorMessage(this.error, 'maximum-rar-days'),
    },
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    usingRarDays: this.utils.booleanValue(this.referral.usingRarDays, 'using-rar-days'),
    maximumRarDays: this.utils.stringValue(this.referral.maximumRarDays, 'maximum-rar-days'),
  }
}
