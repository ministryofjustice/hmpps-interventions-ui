import actionPlanAppointmentFactory from '../../../../../testutils/factories/actionPlanAppointment'
import initialAssessmentAppointmentFactory from '../../../../../testutils/factories/initialAssessmentAppointment'
import deliusServiceUserFactory from '../../../../../testutils/factories/deliusServiceUser'
import SubmittedFeedbackPresenter from './submittedFeedbackPresenter'
import AppointmentSummary from '../../../appointments/appointmentSummary'

describe(SubmittedFeedbackPresenter, () => {
  const userType = 'service-provider'
  const referralId = 'referral-id'

  describe('text', () => {
    it('includes the title of the page', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanAppointment = actionPlanAppointmentFactory.build()
      let presenter = new SubmittedFeedbackPresenter(
        actionPlanAppointment,
        new AppointmentSummary(actionPlanAppointment),
        serviceUser,
        userType,
        referralId
      )
      expect(presenter.text).toMatchObject({
        title: 'View feedback',
      })
      const initialAssessmentAppointment = initialAssessmentAppointmentFactory.build()
      presenter = new SubmittedFeedbackPresenter(
        initialAssessmentAppointment,
        new AppointmentSummary(actionPlanAppointment),
        serviceUser,
        userType,
        referralId
      )
      expect(presenter.text).toMatchObject({
        title: 'View feedback',
      })
    })
  })

  describe('backLinkHref', () => {
    it('contains a link back to the referral progress page, including the userType and referral id in the URL', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanAppointment = actionPlanAppointmentFactory.build()
      const presenter = new SubmittedFeedbackPresenter(
        actionPlanAppointment,
        new AppointmentSummary(actionPlanAppointment),
        serviceUser,
        'probation-practitioner',
        'test-referral-id'
      )

      expect(presenter.backLinkHref).toEqual('/probation-practitioner/referrals/test-referral-id/progress')
    })
  })
})
