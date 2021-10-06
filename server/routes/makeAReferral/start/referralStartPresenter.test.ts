import ReferralStartPresenter from './referralStartPresenter'

describe('ReferralStartPresenter', () => {
  describe('hrefStartReferral', () => {
    it('returns a link including the intervention ID to start the referral', () => {
      const presenter = new ReferralStartPresenter('6a5735c6-3a2c-4896-9565-461417aa1c77')

      expect(presenter.hrefStartReferral).toEqual(`/intervention/6a5735c6-3a2c-4896-9565-461417aa1c77/refer`)
    })
  })
})
