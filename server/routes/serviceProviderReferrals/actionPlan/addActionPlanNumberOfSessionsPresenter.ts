import { ServiceCategory } from '../../../services/interventionsService'
import utils from '../../../utils/utils'
import { DeliusServiceUser } from '../../../services/communityApiService'
import { FormValidationError } from '../../../utils/formValidationError'
import ReferralDataPresenterUtils from '../../referrals/referralDataPresenterUtils'

export default class AddActionPlanNumberOfSessionsPresenter {
  constructor(
    private readonly serviceUser: DeliusServiceUser,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null
  ) {}

  readonly text = {
    errorMessage: ReferralDataPresenterUtils.errorMessage(this.error, 'numberOfSessions'),
    pageNumber: 2,
    serviceUserFirstName: this.serviceUser.firstName,
    serviceCategoryName: utils.convertToProperCase(this.serviceCategory.name),
  }
}
