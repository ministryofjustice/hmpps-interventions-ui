import { DraftReferral, ServiceCategory } from '../../services/interventionsService'

export default class CheckAnswersPresenter {
  constructor(private readonly referral: DraftReferral, private readonly serviceCategory: ServiceCategory) {}

  // TODO IC-679 build this page properly - this
  // is just a placeholder to show the data’s coming in
  readonly serviceUserName = this.referral.serviceUser?.firstName ?? ''

  readonly referralSectionHeading = `Information for the ${this.serviceCategory.name} referral`
}
