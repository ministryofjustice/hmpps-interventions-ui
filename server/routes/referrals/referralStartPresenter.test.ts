import draftReferralFactory from '../../../testutils/factories/draftReferral'
import ReferralStartPresenter from './referralStartPresenter'

describe('ReferralStartPresenter', () => {
  describe('orderedReferrals', () => {
    it('returns an ordered list of draft referrals with formatted dates', () => {
      const referrals = [
        draftReferralFactory.createdAt(new Date('2021-01-02T12:00:00Z')).build(),
        draftReferralFactory.createdAt(new Date('2021-01-03T12:00:00Z')).build(),
        draftReferralFactory.createdAt(new Date('2021-01-01T12:00:00Z')).build(),
      ]

      const presenter = new ReferralStartPresenter(referrals)

      // referrals are ordered oldest first
      expect(presenter.orderedReferrals).toEqual([
        expect.objectContaining({ createdAt: '01/01/2021' }),
        expect.objectContaining({ createdAt: '02/01/2021' }),
        expect.objectContaining({ createdAt: '03/01/2021' }),
      ])
    })
  })
})
