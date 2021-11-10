import SentReferral from '../../../models/sentReferral'
import LoggedInUser from '../../../models/loggedInUser'
import PrimaryNavBarPresenter from '../../shared/primaryNavBar/primaryNavBarPresenter'

export default class ConfirmationPresenter {
  constructor(private readonly referral: SentReferral, private readonly loggedInUser: LoggedInUser) {}

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Find interventions', this.loggedInUser)

  readonly text = {
    title: `We’ve sent your referral to ${this.referral.referral.serviceProvider.name}`,
    referenceNumberIntro: `Your reference number`,
    referenceNumber: this.referral.referenceNumber,
    whatHappensNext: `${this.referral.referral.serviceProvider.name} will be in contact within 10 days to schedule the assessment.`,
  }
}
