import ConfirmationPresenter from './confirmationPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'

describe(ConfirmationPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const referral = sentReferralFactory.build()
      const presenter = new ConfirmationPresenter(referral)

      expect(presenter.text).toEqual({
        title: `We’ve sent your referral to Harmony Living`,
        referenceNumberIntro: `Your reference number`,
        referenceNumber: referral.referenceNumber,
        whatHappensNext: 'Harmony Living will be in contact within 10 days to schedule the assessment.',
      })
    })
  })
})
