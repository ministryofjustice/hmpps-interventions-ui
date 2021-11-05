import DeliverySessionSchedulingCheckAnswersPresenter from './deliverySessionSchedulingCheckAnswersPresenter'
import { createDraftFactory } from '../../../../testutils/factories/draft'
import { DraftAppointmentBooking } from '../../serviceProviderReferrals/draftAppointmentBooking'

const draftBookingFactory = createDraftFactory<DraftAppointmentBooking>({
  appointmentTime: '2021-03-24T09:02:00.000Z',
  durationInMinutes: 75,
  sessionType: 'ONE_TO_ONE',
  appointmentDeliveryType: 'PHONE_CALL',
  appointmentDeliveryAddress: null,
  npsOfficeCode: null,
})

describe(DeliverySessionSchedulingCheckAnswersPresenter, () => {
  describe('summary', () => {
    it('returns a summary of the draft booking', () => {
      const draft = draftBookingFactory.build()
      const presenter = new DeliverySessionSchedulingCheckAnswersPresenter(draft, '1', '1', 2)

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
      const presenter = new DeliverySessionSchedulingCheckAnswersPresenter(draft, '1', '1', 2)

      expect(presenter.backLinkHref).toEqual(
        `/service-provider/referral/1/session/2/appointment/1/edit/${draft.id}/details`
      )
    })
  })

  describe('formAction', () => {
    it('returns the relative URL of the submit page', () => {
      const draft = draftBookingFactory.build()
      const presenter = new DeliverySessionSchedulingCheckAnswersPresenter(draft, '1', '1', 2)

      expect(presenter.formAction).toEqual(
        `/service-provider/referral/1/session/2/appointment/1/edit/${draft.id}/submit`
      )
    })
  })

  describe('title', () => {
    it('returns the page’s title', () => {
      const presenter = new DeliverySessionSchedulingCheckAnswersPresenter(draftBookingFactory.build(), '1', '1', 2)

      expect(presenter.title).toEqual('Confirm session 2 details')
    })
  })
})
