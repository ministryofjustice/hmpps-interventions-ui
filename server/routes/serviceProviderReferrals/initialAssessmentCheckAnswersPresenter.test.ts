import InitialAssessmentCheckAnswersPresenter from './initialAssessmentCheckAnswersPresenter'
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

describe(InitialAssessmentCheckAnswersPresenter, () => {
  describe('summary', () => {
    it('returns a summary of the draft booking', () => {
      const draft = draftBookingFactory.build()
      const presenter = new InitialAssessmentCheckAnswersPresenter(draft, '1')

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
      const presenter = new InitialAssessmentCheckAnswersPresenter(draft, '1')

      expect(presenter.backLinkHref).toEqual(
        `/service-provider/referrals/1/supplier-assessment/schedule/${draft.id}/details`
      )
    })
  })

  describe('formAction', () => {
    it('returns the relative URL of the submit page', () => {
      const draft = draftBookingFactory.build()
      const presenter = new InitialAssessmentCheckAnswersPresenter(draft, '1')

      expect(presenter.formAction).toEqual(
        `/service-provider/referrals/1/supplier-assessment/schedule/${draft.id}/submit`
      )
    })
  })

  describe('title', () => {
    it('returns the page’s title', () => {
      const presenter = new InitialAssessmentCheckAnswersPresenter(draftBookingFactory.build(), '1')

      expect(presenter.title).toEqual('Confirm appointment details')
    })
  })
})
