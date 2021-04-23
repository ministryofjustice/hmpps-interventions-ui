import { ActionPlan, ServiceCategoryFull } from '../../services/interventionsService'
import utils from '../../utils/utils'
import { DeliusServiceUser } from '../../services/communityApiService'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import ServiceUserBannerPresenter from '../shared/serviceUserBannerPresenter'

export default class ActionPlanNumberOfSessionsPresenter {
  constructor(
    private readonly actionPlan: ActionPlan,
    private readonly serviceUser: DeliusServiceUser,
    private readonly serviceCategory: ServiceCategoryFull,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly serviceUserBannerPresenter = new ServiceUserBannerPresenter(this.serviceUser)

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)} - create action plan`,
    numberOfSessions: {
      errorMessage: PresenterUtils.errorMessage(this.error, 'number-of-sessions'),
    },
    pageNumber: 2,
    serviceUserFirstName: this.serviceUser.firstName,
    serviceCategoryName: utils.convertToProperCase(this.serviceCategory.name),
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    numberOfSessions: this.utils.stringValue(this.actionPlan.numberOfSessions, 'number-of-sessions'),
  }
}
