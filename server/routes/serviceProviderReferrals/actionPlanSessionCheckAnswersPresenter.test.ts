import ActionPlanSessionCheckAnswersPresenter from './actionPlanSessionCheckAnswersPresenter'
import { createDraftFactory } from '../../../testutils/factories/draft'
import { DraftAppointmentBooking } from './serviceProviderReferralsController'

const draftBookingFactory = createDraftFactory<DraftAppointmentBooking>({
  appointmentTime: '2021-03-24T09:02:00.000Z',
  durationInMinutes: 75,
  sessionType: 'ONE_TO_ONE',
  appointmentDeliveryType: 'PHONE_CALL',
  appointmentDeliveryAddress: null,
  npsOfficeCode: null,
})

describe(ActionPlanSessionCheckAnswersPresenter, () => {
  describe('summary', () => {
    it('returns a summary of the draft booking', () => {
      const draft = draftBookingFactory.build()
      const presenter = new ActionPlanSessionCheckAnswersPresenter(draft, '1', 2)

      expect(presenter.summary).toEqual([
        { key: 'Date', lines: ['24 March 2021'] },
        { key: 'Time', lines: ['9:02am to 10:17am'] },
        { key: 'Method', lines: ['Phone call'] },
      ])
    })
  })

  describe('backLinkHref', () => {
    it('returns the relative URL of the details page', () => {
      const draft = draftBookingFactory.build()
      const presenter = new ActionPlanSessionCheckAnswersPresenter(draft, '1', 2)

      expect(presenter.backLinkHref).toEqual(`/service-provider/action-plan/1/sessions/2/edit/${draft.id}/details`)
    })
  })

  describe('formAction', () => {
    it('returns the relative URL of the submit page', () => {
      const draft = draftBookingFactory.build()
      const presenter = new ActionPlanSessionCheckAnswersPresenter(draft, '1', 2)

      expect(presenter.formAction).toEqual(`/service-provider/action-plan/1/sessions/2/edit/${draft.id}/submit`)
    })
  })

  describe('title', () => {
    it('returns the page’s title', () => {
      const presenter = new ActionPlanSessionCheckAnswersPresenter(draftBookingFactory.build(), '1', 2)

      expect(presenter.title).toEqual('Confirm session 2 details')
    })
  })
})
