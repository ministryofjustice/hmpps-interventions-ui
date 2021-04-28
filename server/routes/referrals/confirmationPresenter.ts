import SentReferral from '../../models/sentReferral'

export default class ConfirmationPresenter {
  constructor(private readonly referral: SentReferral) {}

  readonly text = {
    title: `We’ve sent your referral to ${this.referral.referral.serviceProvider.name}`,
    referenceNumberIntro: `Your reference number`,
    referenceNumber: this.referral.referenceNumber,
    whatHappensNext: `${this.referral.referral.serviceProvider.name} will be in contact within 10 days to schedule the assessment.`,
  }
}
