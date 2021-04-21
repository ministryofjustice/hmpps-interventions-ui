import draftReferralFactory from '../../../testutils/factories/draftReferral'
import FindStartPresenter from './findStartPresenter'

describe('FindStartPresenter', () => {
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

  describe('orderedReferrals', () => {
    it('returns an ordered list of draft referrals with formatted dates and names', () => {
      const presenter = new FindStartPresenter(referrals)

      expect(presenter.orderedReferrals).toEqual([
        expect.objectContaining({ createdAt: '1 Jan 2021', serviceUserFullName: 'Jenny Catherine' }),
        expect.objectContaining({ createdAt: '2 Jan 2021', serviceUserFullName: 'Rob Shah-Brookes' }),
        expect.objectContaining({ createdAt: '3 Jan 2021', serviceUserFullName: 'Hardip Fraiser' }),
      ])
    })
  })
})
