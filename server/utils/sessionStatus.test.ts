import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import sessionStatus, { SessionStatus } from './sessionStatus'

describe(sessionStatus.forAppointment, () => {
  describe('when the appointment was not attended', () => {
    const appointment = actionPlanAppointmentFactory.build({
      sessionFeedback: {
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
    const onTimeAppointment = actionPlanAppointmentFactory.build({
      sessionFeedback: {
        attendance: {
          attended: 'yes',
        },
      },
    })

    const lateAppointment = actionPlanAppointmentFactory.build({
      sessionFeedback: {
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
    const scheduledAppointment = actionPlanAppointmentFactory.scheduled().build({
      sessionFeedback: {
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

    it('returns "did not attend" status', () => {
      expect(sessionStatus.forAppointment(scheduledAppointment)).toEqual(SessionStatus.scheduled)
    })
  })

  describe('when the appointment has not yet been scheduled', () => {
    const unscheduledAppointment = actionPlanAppointmentFactory.newlyCreated().build()

    it('returns "did not attend" status', () => {
      expect(sessionStatus.forAppointment(unscheduledAppointment)).toEqual(SessionStatus.notScheduled)
    })
  })
})
