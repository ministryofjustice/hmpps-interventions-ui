import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ReferralStartPresenter {
  constructor(private readonly interventionId: string, private readonly error: FormValidationError | null = null) {}

  readonly text = {
    errorMessage: PresenterUtils.errorMessage(this.error, 'service-user-crn'),
  }

  readonly hrefStartReferral = `/intervention/${this.interventionId}/refer`
}
