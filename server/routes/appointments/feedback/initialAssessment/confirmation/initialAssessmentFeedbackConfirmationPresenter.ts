export default class InitialAssessmentFeedbackConfirmationPresenter {
  constructor(private readonly referralId: string) {}

  progressHref = `/service-provider/referrals/${this.referralId}/progress`
}
