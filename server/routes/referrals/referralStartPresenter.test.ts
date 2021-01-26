import draftReferralFactory from '../../../testutils/factories/draftReferral'
import ReferralStartPresenter from './referralStartPresenter'

describe('ReferralStartPresenter', () => {
  describe('orderedReferrals', () => {
    it('returns an ordered list of draft referrals with formatted dates and names', () => {
      const referrals = [
        draftReferralFactory.createdAt(new Date('2021-01-02T12:00:00Z')).build({
          serviceUser: {
            firstName: 'rob',
            lastName: 'shah-brookes',
          },
        }),
        draftReferralFactory.createdAt(new Date('2021-01-03T12:00:00Z')).build({
          serviceUser: {
            firstName: 'HARDIP',
            lastName: 'fraiser',
          },
        }),
        draftReferralFactory.createdAt(new Date('2021-01-01T12:00:00Z')).build({
          serviceUser: {
            firstName: 'Jenny',
            lastName: 'Catherine',
          },
        }),
      ]

      const presenter = new ReferralStartPresenter(referrals)

      // referrals are ordered oldest first
      expect(presenter.orderedReferrals).toEqual([
        expect.objectContaining({ createdAt: '01/01/2021', serviceUserFullName: 'Jenny Catherine' }),
        expect.objectContaining({ createdAt: '02/01/2021', serviceUserFullName: 'Rob Shah-Brookes' }),
        expect.objectContaining({ createdAt: '03/01/2021', serviceUserFullName: 'Hardip Fraiser' }),
      ])
    })
  })
})
