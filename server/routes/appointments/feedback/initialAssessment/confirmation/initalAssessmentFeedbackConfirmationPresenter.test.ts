import InitialAssessmentFeedbackConfirmationPresenter from './initialAssessmentFeedbackConfirmationPresenter'

describe(InitialAssessmentFeedbackConfirmationPresenter, () => {
  describe('progressHref', () => {
    it('returns the relative URL of the service provider referral progress page', () => {
      const referralId = '9c84b308-2ebb-427a-9b9f-c4da06f5e7c3'
      const presenter = new InitialAssessmentFeedbackConfirmationPresenter(referralId)
      expect(presenter.progressHref).toEqual(
        `/service-provider/referrals/9c84b308-2ebb-427a-9b9f-c4da06f5e7c3/progress`
      )
    })
  })
})
