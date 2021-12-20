import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import ActionPlanPostSessionAttendanceFeedbackPresenter from './actionPlanPostSessionAttendanceFeedbackPresenter'
import AppointmentSummary from '../../../appointmentSummary'

describe(ActionPlanPostSessionAttendanceFeedbackPresenter, () => {
  describe('text', () => {
    it('contains a title including the name of the service category and a subtitle, and the attendance questions', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
        appointment,
        serviceUser,
        new AppointmentSummary(appointment)
      )

      expect(presenter.text).toMatchObject({
        title: 'Add attendance feedback',
        subTitle: 'Session details',
        attendanceQuestion: 'Did Alex attend this session?',
        attendanceQuestionHint: 'Select one option',
        additionalAttendanceInformationLabel: "Add additional information about Alex's attendance:",
      })
    })

    describe('when the session is a phone call', () => {
      it('contains an attendance question to indicate the meeting was a phone call', () => {
        const appointment = actionPlanAppointmentFactory.build({ appointmentDeliveryType: 'PHONE_CALL' })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment)
        )
        expect(presenter.text.attendanceQuestion).toEqual('Did Alex join this phone call?')
      })
    })

    describe('when the session is a video call', () => {
      it('contains an attendance question to indicate the meeting was a video call', () => {
        const appointment = actionPlanAppointmentFactory.build({ appointmentDeliveryType: 'VIDEO_CALL' })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment)
        )
        expect(presenter.text.attendanceQuestion).toEqual('Did Alex join this video call?')
      })
    })

    describe('when the session is an other location meeting', () => {
      it('contains an attendance question to indicate the meeting was an in-person meeting', () => {
        const appointment = actionPlanAppointmentFactory.build({ appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER' })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment)
        )
        expect(presenter.text.attendanceQuestion).toEqual('Did Alex attend this in-person meeting?')
      })
    })

    describe('when the session is an nps office location meeting', () => {
      it('contains an attendance question to indicate the meeting was an in-person meeting', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment)
        )
        expect(presenter.text.attendanceQuestion).toEqual('Did Alex attend this in-person meeting?')
      })
    })
  })

  describe('backLinkHref', () => {
    describe('when a draftId, actionPlan, sessionNumber is provided', () => {
      it('is a link back to the check answers page for scheduling appointment', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const serviceUser = deliusServiceUserFactory.build()
        const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment),
          'test-referral-id',
          'actionPlanId',
          'draftId'
        )
        expect(presenter.backLinkHref).toEqual(
          '/service-provider/action-plan/actionPlanId/sessions/1/edit/draftId/check-answers'
        )
      })
    })
    describe('when a referral id is passed in', () => {
      it('is a link back to the Intervention Progress page', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const serviceUser = deliusServiceUserFactory.build()
        const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment),
          'test-referral-id'
        )
        expect(presenter.backLinkHref).toEqual('/service-provider/referrals/test-referral-id/progress')
      })
    })

    describe('when a referral id or draftId is not passed in', () => {
      it('is null', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const serviceUser = deliusServiceUserFactory.build()
        const presenter = new ActionPlanPostSessionAttendanceFeedbackPresenter(
          appointment,
          serviceUser,
          new AppointmentSummary(appointment)
        )
        expect(presenter.backLinkHref).toEqual(null)
      })
    })
  })
})
