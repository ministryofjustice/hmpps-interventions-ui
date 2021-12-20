import ActionPlanSessionCheckAnswersPresenter from './actionPlanSessionCheckAnswersPresenter'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'

describe(ActionPlanSessionCheckAnswersPresenter, () => {
  describe('summary', () => {
    it('returns a summary of the draft booking', () => {
      const appointment = actionPlanAppointmentFactory.scheduled().build({
        appointmentTime: '2021-03-24T09:02:00.000Z',
        durationInMinutes: 75,
        sessionType: 'ONE_TO_ONE',
        appointmentDeliveryType: 'PHONE_CALL',
      })
      const presenter = new ActionPlanSessionCheckAnswersPresenter(appointment, '1', 2, 'draftId')

      expect(presenter.summary).toEqual([
        { key: 'Date', lines: ['24 March 2021'] },
        { key: 'Time', lines: ['9:02am to 10:17am'] },
        { key: 'Method', lines: ['Phone call'] },
      ])
    })
  })

  describe('backLinkHref', () => {
    it('returns the relative URL of the details page', () => {
      const appointment = actionPlanAppointmentFactory.scheduled().build()
      const presenter = new ActionPlanSessionCheckAnswersPresenter(appointment, '1', 2, 'draftId')

      expect(presenter.backLinkHref).toEqual(`/service-provider/action-plan/1/sessions/2/edit/draftId/details`)
    })
  })

  describe('formAction', () => {
    it('returns the relative URL of the submit page', () => {
      const appointment = actionPlanAppointmentFactory.scheduled().build()
      const presenter = new ActionPlanSessionCheckAnswersPresenter(appointment, '1', 2, 'draftId')

      expect(presenter.formAction).toEqual(`/service-provider/action-plan/1/sessions/2/edit/draftId/submit`)
    })
  })

  describe('title', () => {
    it('returns the page’s title', () => {
      const appointment = actionPlanAppointmentFactory.scheduled().build()
      const presenter = new ActionPlanSessionCheckAnswersPresenter(appointment, '1', 2, 'draftId')

      expect(presenter.title).toEqual('Confirm session 2 details')
    })
  })

  describe('pastAppointment', () => {
    describe('when the appointment time is in the past', () => {
      it('returns true', () => {
        const appointment = actionPlanAppointmentFactory.scheduled().build({
          appointmentTime: '1900-03-24T09:02:00.000Z',
        })
        const presenter = new ActionPlanSessionCheckAnswersPresenter(appointment, '1', 2, 'draftId')

        expect(presenter.pastAppointment).toEqual(true)
      })
    })
    describe('when the appointment time is in the future', () => {
      it('returns false', () => {
        const appointment = actionPlanAppointmentFactory.scheduled().build({
          appointmentTime: '3000-03-24T09:02:00.000Z',
        })
        const presenter = new ActionPlanSessionCheckAnswersPresenter(appointment, '1', 2, 'draftId')

        expect(presenter.pastAppointment).toEqual(false)
      })
    })
    describe('when no appointment time is provided', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const presenter = new ActionPlanSessionCheckAnswersPresenter(appointment, '1', 2, 'draftId')

        expect(() => presenter.pastAppointment).toThrow('Draft has null data on check your answers page')
      })
    })
  })
})
