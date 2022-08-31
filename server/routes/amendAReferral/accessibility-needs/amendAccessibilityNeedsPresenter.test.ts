import AmendAccessibilityNeedsPresenter from './amendAccessibilityNeedsPresenter'
import SentReferralFactory from '../../../../testutils/factories/sentReferral'
import deliusServiceUserFactory from '../../../../testutils/factories/deliusServiceUser'

describe('AmendDesiredOutcomesPresenter', () => {
  const referral = SentReferralFactory.build({
    referral: {
      accessibilityNeeds: 'wheel chair car',
    },
  })

  const deliusServiceUser = deliusServiceUserFactory.build()

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendAccessibilityNeedsPresenter(referral, deliusServiceUser)
        expect(presenter.reasonForChangeErrorMessage).toBeNull()
      })
    })
    it('returns error information for reason for change field', () => {
      const presenter = new AmendAccessibilityNeedsPresenter(referral, deliusServiceUser, {
        errors: [
          {
            formFields: ['reason-for-change'],
            errorSummaryLinkedField: 'reason-for-change',
            message: 'Enter reason for change',
          },
        ],
      })
      expect(presenter.reasonForChangeErrorMessage).toEqual('Enter reason for change')
    })
  })
  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendAccessibilityNeedsPresenter(referral, deliusServiceUser)
        expect(presenter.errorSummary).toBeNull()
      })
    })
  })
})
