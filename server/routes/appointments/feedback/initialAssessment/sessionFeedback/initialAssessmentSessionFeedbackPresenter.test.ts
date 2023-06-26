import initialAssessmentAppointmentFactory from '../../../../../../testutils/factories/initialAssessmentAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import InitialAssessmentSessionFeedbackPresenter from './initialAssessmentSessionFeedbackPresenter'

describe(InitialAssessmentSessionFeedbackPresenter, () => {
  describe('backLinkHref', () => {
    it('contains the link to the attendance page with the referral id', () => {
      const initialAssessmentAppointment = initialAssessmentAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new InitialAssessmentSessionFeedbackPresenter(
        initialAssessmentAppointment,
        serviceUser,
        'test-referral-id'
      )

      expect(presenter.backLinkHref).toEqual(
        '/service-provider/referrals/test-referral-id/supplier-assessment/post-assessment-feedback/attendance'
      )
    })
  })
})
