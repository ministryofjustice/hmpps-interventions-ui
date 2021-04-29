import ReferralCancellationCheckAnswersPresenter from './referralCancellationCheckAnswersPresenter'

describe(ReferralCancellationCheckAnswersPresenter, () => {
  describe('text', () => {
    it('contains a title and confirmation question', () => {
      const presenter = new ReferralCancellationCheckAnswersPresenter('89047822-1014-4f8f-a52c-c348137c89a5')

      expect(presenter.text).toMatchObject({
        title: 'Referral Cancellation',
        confirmationQuestion: 'Are you sure you want to cancel this referral?',
      })
    })
  })

  describe('confirmCancellationHref', () => {
    it('contains a reference to the referral cancellation endpoint', () => {
      const presenter = new ReferralCancellationCheckAnswersPresenter('89047822-1014-4f8f-a52c-c348137c89a5')
      expect(presenter.confirmCancellationHref).toEqual(
        '/probation-practitioner/referrals/89047822-1014-4f8f-a52c-c348137c89a5/cancellation/submit'
      )
    })
  })

  describe('hiddenFields', () => {
    it('contains the cancellation code and comments', () => {
      const presenter = new ReferralCancellationCheckAnswersPresenter(
        '89047822-1014-4f8f-a52c-c348137c89a5',
        'MOV',
        'Alex moved out of the area'
      )

      expect(presenter.hiddenFields).toMatchObject({
        cancellationReason: 'MOV',
        cancellationComments: 'Alex moved out of the area',
      })
    })
  })
})
