import { SentReferral, ServiceCategory } from '../../../services/interventionsService'
import utils from '../../../utils/utils'

export default class AddActionPlanActivitiesPresenter {
  constructor(private readonly sentReferral: SentReferral, private readonly serviceCategory: ServiceCategory) {}

  readonly text = {
    title: `${utils.convertToProperCase(this.serviceCategory.name)} - create action plan`,
    subTitle: `Add suggested activities to ${this.sentReferral.referral.serviceUser.firstName}’s action plan`,
  }
}
