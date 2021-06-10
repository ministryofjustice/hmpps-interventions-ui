import ScheduleActionPlanSessionPresenter from './scheduleActionPlanSessionPresenter'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'

describe(ScheduleActionPlanSessionPresenter, () => {
  // The rest of this class is tested in its superclass’s tests.

  describe('text.title', () => {
    it('contains the appointment number', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
      const presenter = new ScheduleActionPlanSessionPresenter(appointment)

      expect(presenter.text).toEqual({ title: 'Add session 1 details' })
    })
  })
})
