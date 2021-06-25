import AppointmentDecorator from './appointmentDecorator'
import appointmentFactory from '../../testutils/factories/appointment'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import Duration from '../utils/duration'

describe(AppointmentDecorator, () => {
  describe('britishDay', () => {
    describe('when the appointment has a time', () => {
      it('returns the day on which the appointment takes place in Britain', () => {
        const appointment = appointmentFactory.build({ appointmentTime: '2021-02-25T23:30:00Z' })
        const decorator = new AppointmentDecorator(appointment)

        expect(decorator.britishDay).toEqual({ day: 25, month: 2, year: 2021 })
      })
    })

    describe('when the appointment does not have a time', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.newlyCreated().build()
        const decorator = new AppointmentDecorator(appointment)

        expect(decorator.britishDay).toBeNull()
      })
    })
  })

  describe('britishTime', () => {
    it('returns the time at which the appointment takes place in Britain', () => {
      const appointment = appointmentFactory.build({ appointmentTime: '2021-02-25T23:30:05Z' })
      const decorator = new AppointmentDecorator(appointment)

      expect(decorator.britishTime).toEqual({
        hour: 23,
        minute: 30,
        second: 5,
      })
    })

    describe('when the appointment does not have a time', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.newlyCreated().build()
        const decorator = new AppointmentDecorator(appointment)

        expect(decorator.britishTime).toBeNull()
      })
    })
  })

  describe('britishEndsAtTime', () => {
    it('returns the time at which the appointment takes place in Britain', () => {
      const appointment = appointmentFactory.build({ appointmentTime: '2021-02-25T10:30:05Z', durationInMinutes: 80 })
      const decorator = new AppointmentDecorator(appointment)

      expect(decorator.britishEndsAtTime).toEqual({
        hour: 11,
        minute: 50,
        second: 5,
      })
    })

    describe('when the appointment does not have a time and duration', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.newlyCreated().build()
        const decorator = new AppointmentDecorator(appointment)

        expect(decorator.britishEndsAtTime).toBeNull()
      })
    })
  })

  describe('duration', () => {
    it('returns the duration of the appointment', () => {
      const appointment = appointmentFactory.build({ durationInMinutes: 60 })
      const decorator = new AppointmentDecorator(appointment)

      expect(decorator.duration).toEqual(Duration.fromUnits(0, 60, 0))
    })

    describe('when the appointment does not have a duration', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.newlyCreated().build()
        const decorator = new AppointmentDecorator(appointment)

        expect(decorator.duration).toBeNull()
      })
    })
  })
})
