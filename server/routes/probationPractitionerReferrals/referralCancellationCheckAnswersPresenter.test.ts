import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import ReferralCancellationCheckAnswersPresenter from './referralCancellationCheckAnswersPresenter'

describe(ReferralCancellationCheckAnswersPresenter, () => {
  describe('text', () => {
    it('contains a title and confirmation question', () => {
      const serviceUser = deliusServiceUser.build()
      const presenter = new ReferralCancellationCheckAnswersPresenter(
        '89047822-1014-4f8f-a52c-c348137c89a5',
        serviceUser
      )

      expect(presenter.text).toMatchObject({
        title: 'Referral Cancellation',
        confirmationQuestion: 'Are you sure you want to cancel this referral?',
      })
    })
  })

  describe('confirmCancellationHref', () => {
    it('contains a reference to the referral cancellation endpoint', () => {
      const serviceUser = deliusServiceUser.build()
      const presenter = new ReferralCancellationCheckAnswersPresenter(
        '89047822-1014-4f8f-a52c-c348137c89a5',
        serviceUser
      )
      expect(presenter.confirmCancellationHref).toEqual(
        '/probation-practitioner/referrals/89047822-1014-4f8f-a52c-c348137c89a5/cancellation/submit'
      )
    })
  })

  describe('serviceUserBanner', () => {
    it('is defined', () => {
      const serviceUser = deliusServiceUser.build()
      const presenter = new ReferralCancellationCheckAnswersPresenter(
        '89047822-1014-4f8f-a52c-c348137c89a5',
        serviceUser
      )

      expect(presenter.serviceUserBannerPresenter).toBeDefined()
    })
  })
})
