import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ReferralCreationReasonPresenter from './referralCreationReasonPresenter'

describe('ReferralCreationReasonPresenter', () => {
  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey' } })
      const presenter = new ReferralCreationReasonPresenter(referral)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/confirm-main-point-of-contact`)
      expect(presenter.text).toEqual({
        title: `Enter reason why referral is being made before a probation practitioner has been allocated (if known)`,
        label: 'Geoffrey River (CRN: X123456)',
      })
    })
  })
})
