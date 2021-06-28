import ReferralCancellationCheckAnswersPresenter from './referralCancellationCheckAnswersPresenter'

describe(ReferralCancellationCheckAnswersPresenter, () => {
  describe('text', () => {
    it('contains a title and confirmation question', () => {
      const presenter = new ReferralCancellationCheckAnswersPresenter('', '')

      expect(presenter.text).toMatchObject({
        title: 'Referral Cancellation',
        confirmationQuestion: 'Are you sure you want to cancel this referral?',
      })
    })
  })

  describe('confirmCancellationHref', () => {
    it('contains a reference to the referral cancellation endpoint', () => {
      const presenter = new ReferralCancellationCheckAnswersPresenter(
        '89047822-1014-4f8f-a52c-c348137c89a5',
        'e3eac95b-787b-4ab9-93fd-39df32aabc41'
      )
      expect(presenter.confirmCancellationHref).toEqual(
        '/probation-practitioner/referrals/89047822-1014-4f8f-a52c-c348137c89a5/cancellation/e3eac95b-787b-4ab9-93fd-39df32aabc41/submit'
      )
    })
  })
})
