import { DraftReferral, ServiceCategory } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class FurtherInformationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {}

  readonly title = `Do you have further information for the ${this.serviceCategory.name} service provider? (optional)`

  readonly hint =
    'For example, relevant previous offences, previously completed programmes or further reasons for this referral'

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'further-information')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  get value(): string {
    if (this.userInputData !== null) {
      return this.userInputData['further-information'] ?? ''
    }

    if (this.referral.furtherInformation) {
      return this.referral.furtherInformation
    }

    return ''
  }
}
