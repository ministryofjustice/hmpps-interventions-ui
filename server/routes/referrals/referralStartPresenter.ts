import { FormValidationError } from '../../utils/formValidationError'
import ReferralDataPresenterUtils from './referralDataPresenterUtils'

export default class ReferralStartPresenter {
  constructor(private readonly interventionId: string, private readonly error: FormValidationError | null = null) {}

  readonly text = {
    errorMessage: ReferralDataPresenterUtils.errorMessage(this.error, 'service-user-crn'),
  }

  readonly hrefStartReferral = `/intervention/${this.interventionId}/refer`
}
