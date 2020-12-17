import { DraftReferral, ServiceCategory } from '../../services/interventionsService'

export interface FurtherInformationError {
  message: string
}

export default class FurtherInformationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    readonly error: FurtherInformationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {}

  readonly title = `Do you have further information for the ${this.serviceCategory.name} service provider? (optional)`

  readonly hint =
    'For example, relevant previous offences, previously completed programmes or further reasons for this referral'

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
