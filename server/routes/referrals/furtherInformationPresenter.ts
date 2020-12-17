import { ServiceCategory } from '../../services/interventionsService'

export interface FurtherInformationError {
  message: string
}

export default class FurtherInformationPresenter {
  constructor(
    private readonly serviceCategory: ServiceCategory,
    readonly error: FurtherInformationError | null = null
  ) {}

  readonly title = `Do you have further information for the ${this.serviceCategory.name} service provider? (optional)`

  readonly hint =
    'For example, relevant previous offences, previously completed programmes or further reasons for this referral'
}
