import { SentReferral, ServiceProvider } from '../../services/interventionsService'

export default class ConfirmationPresenter {
  constructor(private readonly referral: SentReferral, private readonly serviceProvider: ServiceProvider) {}

  readonly text = {
    title: `We’ve sent your referral to ${this.serviceProvider.name}`,
    referenceNumberIntro: `Your reference number`,
    referenceNumber: this.referral.referenceNumber,
    whatHappensNext: `${this.serviceProvider.name} will be in contact within 10 days to schedule the assessment.`,
  }
}
