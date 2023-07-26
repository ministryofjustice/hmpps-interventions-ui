import ActionPlan from '../../../../models/actionPlan'
import ServiceCategory from '../../../../models/serviceCategory'
import utils from '../../../../utils/utils'
import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class ActionPlanNumberOfSessionsPresenter {
  constructor(
    private readonly actionPlan: ActionPlan,
    private readonly serviceUser: DeliusServiceUser,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly interventionTitle: string
  ) {}

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly text = {
    title: `${utils.convertToProperCase(this.interventionTitle)} - create action plan`,
    numberOfSessions: {
      errorMessage: PresenterUtils.errorMessage(this.error, 'number-of-sessions'),
    },
    serviceUserFirstName: this.serviceUser.name.forename,
    serviceCategoryName: utils.convertToProperCase(this.interventionTitle),
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    numberOfSessions: this.utils.stringValue(this.actionPlan.numberOfSessions, 'number-of-sessions'),
  }

  readonly actionPlanId = this.actionPlan.id

  readonly numberOfActivities = this.actionPlan.activities.length
}
