import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import initialAssessmentAppointmentFactory from '../../testutils/factories/initialAssessmentAppointment'
import sessionStatus, { SessionStatus } from './sessionStatus'

describe(sessionStatus.forAppointment, () => {
  describe('when the appointment was not attended', () => {
    const appointment = initialAssessmentAppointmentFactory.build({
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
    const onTimeAppointment = initialAssessmentAppointmentFactory.build({
      sessionFeedback: {
        submitted: true,
        attendance: {
          attended: 'yes',
        },
      },
    })

    const lateAppointment = initialAssessmentAppointmentFactory.build({
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
    describe('and when the appointment time is in the past', () => {
      const pastDate = new Date(Date.now() - 1000000).toISOString()
      describe('and when the appointment is an action plan appointment', () => {
        const pastAppointment = actionPlanAppointmentFactory.scheduled().build({
          appointmentTime: pastDate,
        })
        it('returns "scheduled" status', () => {
          expect(sessionStatus.forAppointment(pastAppointment)).toEqual(SessionStatus.scheduled)
        })
      })

      describe('and when the appointment is an initial assessment appointment', () => {
        it('returns "awaiting feedback" status', () => {
          const pastAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: pastDate,
          })
          expect(sessionStatus.forAppointment(pastAppointment)).toEqual(SessionStatus.awaitingFeedback)
        })
      })
    })

    describe('when the appointment time is in the future', () => {
      const futureDate = new Date(Date.now() + 1000000).toISOString()
      it('returns "scheduled" status', () => {
        const futureAppointment = initialAssessmentAppointmentFactory.build({
          appointmentTime: futureDate,
        })
        expect(sessionStatus.forAppointment(futureAppointment)).toEqual(SessionStatus.scheduled)
      })
    })
  })

  describe('when the appointment does have feedback, but it has not been submitted', () => {
    const scheduledAppointment = initialAssessmentAppointmentFactory.build({
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
