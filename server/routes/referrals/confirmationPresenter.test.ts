import ConfirmationPresenter from './confirmationPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceProviderFactory from '../../../testutils/factories/serviceProvider'

describe(ConfirmationPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const referral = sentReferralFactory.build()
      const serviceProvider = serviceProviderFactory.build({ name: 'Harmony Living' })
      const presenter = new ConfirmationPresenter(referral, serviceProvider)

      expect(presenter.text).toEqual({
        title: `We’ve sent your referral to Harmony Living`,
        referenceNumberIntro: `Your reference number`,
        referenceNumber: referral.referenceNumber,
        whatHappensNext: 'Harmony Living will be in contact within 10 days to schedule the assessment.',
      })
    })
  })
})
