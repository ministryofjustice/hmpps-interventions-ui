import EditSessionPresenter from './editSessionPresenter'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'

describe(EditSessionPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
      const presenter = new EditSessionPresenter(appointment)

      expect(presenter.text).toEqual({ title: 'Add session 1 details' })
    })
  })

  describe('fields', () => {
    describe('with a newly-created appointment', () => {
      it('returns empty fields', () => {
        const actionPlan = actionPlanAppointmentFactory.newlyCreated().build()
        const presenter = new EditSessionPresenter(actionPlan)

        expect(presenter.fields).toEqual({
          date: {
            errorMessage: null,
            day: { value: '', hasError: false },
            month: { value: '', hasError: false },
            year: { value: '', hasError: false },
          },
          time: {
            errorMessage: null,
            hour: { value: '', hasError: false },
            minute: { value: '', hasError: false },
            partOfDay: {
              value: null,
              hasError: false,
            },
          },
          duration: {
            errorMessage: null,
            hours: { value: '', hasError: false },
            minutes: { value: '', hasError: false },
          },
        })
      })
    })

    describe('with a populated appointment', () => {
      it('returns values to populate the fields with', () => {
        const actionPlan = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-03-24T10:30:00Z',
          durationInMinutes: 75,
        })
        const presenter = new EditSessionPresenter(actionPlan)

        expect(presenter.fields).toEqual({
          date: {
            errorMessage: null,
            day: { value: '24', hasError: false },
            month: { value: '3', hasError: false },
            year: { value: '2021', hasError: false },
          },
          time: {
            errorMessage: null,
            hour: { value: '10', hasError: false },
            minute: { value: '30', hasError: false },
            partOfDay: {
              value: 'am',
              hasError: false,
            },
          },
          duration: {
            errorMessage: null,
            hours: { value: '1', hasError: false },
            minutes: { value: '15', hasError: false },
          },
        })
      })
    })
  })
})
