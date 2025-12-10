import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ReferralStartPresenter {
  readonly backLinkUrl: string

  readonly interventionDetailsPage = `/find-interventions/intervention/${this.interventionId}`

  private formError: FormValidationError | null

  constructor(
    private readonly interventionId: string,
    private readonly error: FormValidationError | null = null
  ) {
    this.backLinkUrl = this.interventionDetailsPage
    this.formError = error
  }

  readonly text = {
    errorMessage: PresenterUtils.errorMessage(this.error, 'service-user-crn'),
  }

  readonly hrefStartReferral = `/intervention/${this.interventionId}/refer`
}
