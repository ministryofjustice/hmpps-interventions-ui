import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ReferralStartPresenter {
  readonly backLinkUrl: string

  readonly interventionDetailsPage = `/find-interventions/intervention/${this.interventionId}`

  constructor(
    private readonly interventionId: string,
    private readonly error: FormValidationError | null = null
  ) {
    this.backLinkUrl = this.interventionDetailsPage
  }

  readonly text = {
    errorMessage: PresenterUtils.errorMessage(this.error, 'service-user-crn'),
  }

  readonly hrefStartReferral = `/intervention/${this.interventionId}/refer`
}
