import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import appointmentFactory from '../../testutils/factories/appointment'
import sessionStatus, { SessionStatus } from './sessionStatus'

describe(sessionStatus.forAppointment, () => {
  describe('when the appointment was not attended', () => {
    const appointment = appointmentFactory.build({
      sessionFeedback: {
        submitted: true,
        attendance: {
          attended: 'no',
        },
      },
    })

    it('returns "did not attend" status', () => {
      expect(sessionStatus.forAppointment(appointment)).toEqual(SessionStatus.didNotAttend)
    })
  })

  describe('when the appointment was attended or the user was late', () => {
    const onTimeAppointment = appointmentFactory.build({
      sessionFeedback: {
        submitted: true,
        attendance: {
          attended: 'yes',
        },
      },
    })

    const lateAppointment = appointmentFactory.build({
      sessionFeedback: {
        submitted: true,
        attendance: {
          attended: 'yes',
        },
      },
    })

    it('returns "completed" status', () => {
      expect(sessionStatus.forAppointment(onTimeAppointment)).toEqual(SessionStatus.completed)
      expect(sessionStatus.forAppointment(lateAppointment)).toEqual(SessionStatus.completed)
    })
  })

  describe('when the appointment does not have feedback, but has an appointment time set', () => {
    const scheduledAppointment = appointmentFactory.build({
      sessionFeedback: {
        submitted: false,
        attendance: {
          attended: null,
          additionalAttendanceInformation: null,
        },
        behaviour: {
          behaviourDescription: null,
          notifyProbationPractitioner: null,
        },
      },
    })

    it('returns "scheduled" status', () => {
      expect(sessionStatus.forAppointment(scheduledAppointment)).toEqual(SessionStatus.scheduled)
    })
  })

  describe('when the appointment does have feedback, but it has not been submitted', () => {
    const scheduledAppointment = appointmentFactory.build({
      sessionFeedback: {
        submitted: false,
        attendance: {
          attended: 'yes',
        },
      },
    })

    it('returns "scheduled" status', () => {
      expect(sessionStatus.forAppointment(scheduledAppointment)).toEqual(SessionStatus.scheduled)
    })
  })

  describe('when the appointment has not yet been scheduled', () => {
    const unscheduledAppointment = actionPlanAppointmentFactory.newlyCreated().build()

    it('returns "not scheduled" status', () => {
      expect(sessionStatus.forAppointment(unscheduledAppointment)).toEqual(SessionStatus.notScheduled)
    })
  })

  describe('when there is not yet an appointment', () => {
    it('returns "not scheduled" status', () => {
      expect(sessionStatus.forAppointment(null)).toEqual(SessionStatus.notScheduled)
    })
  })
})
