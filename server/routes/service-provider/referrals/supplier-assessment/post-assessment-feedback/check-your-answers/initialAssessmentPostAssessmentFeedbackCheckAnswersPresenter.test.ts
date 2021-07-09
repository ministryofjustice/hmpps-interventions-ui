import InitialAssessmentPostAssessmentFeedbackCheckAnswersPresenter from './initialAssessmentPostAssessmentFeedbackCheckAnswersPresenter'
import deliusServiceUserFactory from '../../../../../../../testutils/factories/deliusServiceUser'
import appointmentFactory from '../../../../../../../testutils/factories/appointment'

describe(InitialAssessmentPostAssessmentFeedbackCheckAnswersPresenter, () => {
  describe('submitHref', () => {
    it('includes the referral id', () => {
      const appointment = appointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const referralId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

      const presenter = new InitialAssessmentPostAssessmentFeedbackCheckAnswersPresenter(
        appointment,
        serviceUser,
        referralId
      )

      expect(presenter.submitHref).toEqual(
        '/service-provider/referrals/77f0d8fc-9443-492c-b352-4cab66acbf3c/supplier-assessment/post-assessment-feedback/submit'
      )
    })
  })
})
