import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import { SummaryListItem } from '../../utils/summaryList'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'

export default class CheckAnswersPresenter {
  constructor(private readonly referral: DraftReferral, private readonly serviceCategory: ServiceCategory) {}

  get serviceUserDetailsSection(): { title: string; summary: SummaryListItem[] } {
    return {
      title: `${this.serviceUserName}’s personal details`,
      summary: new ServiceUserDetailsPresenter(this.referral.serviceUser).summary,
    }
  }

  private readonly serviceUserName = this.referral.serviceUser?.firstName ?? ''
}
