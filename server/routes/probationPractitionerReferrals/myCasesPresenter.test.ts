import interventionFactory from '../../../testutils/factories/intervention'
import SentReferralFactory from '../../../testutils/factories/sentReferral'
import MyCasesPresenter from './myCasesPresenter'

describe('MyCasesPresenter', () => {
  const interventions = [
    interventionFactory.build({ id: '1', contractType: { name: 'accommodation' } }),
    interventionFactory.build({ id: '2', contractType: { name: "womens' services" } }),
  ]
  const referrals = [
    SentReferralFactory.assigned().build({
      referral: {
        interventionId: '1',
        serviceUser: {
          firstName: 'rob',
          lastName: 'shah-brookes',
        },
      },
    }),
    SentReferralFactory.unassigned().build({
      referral: {
        interventionId: '2',
        serviceUser: {
          firstName: 'HARDIP',
          lastName: 'fraiser',
        },
      },
    }),
    SentReferralFactory.assigned().build({
      referral: {
        interventionId: '1',
        serviceUser: {
          firstName: 'Jenny',
          lastName: 'Catherine',
        },
      },
    }),
  ]

  describe('tableRows', () => {
    it('returns a list of table rows with appropriate sort values', () => {
      const presenter = new MyCasesPresenter(referrals, interventions)

      expect(presenter.tableRows).toEqual([
        expect.arrayContaining([
          { text: 'Rob Shah-Brookes', sortValue: 'shah-brookes, rob', href: null },
          { text: 'UserABC', sortValue: 'AUserABC', href: null },
          { text: 'Accommodation', sortValue: 'accommodation', href: null },
        ]),
        expect.arrayContaining([
          { text: 'Hardip Fraiser', sortValue: 'fraiser, hardip', href: null },
          { text: 'Unassigned', sortValue: 'Unassigned', href: null },
          { text: "Womens' services", sortValue: "womens' services", href: null },
        ]),
        expect.arrayContaining([
          { text: 'Jenny Catherine', sortValue: 'catherine, jenny', href: null },
          { text: 'UserABC', sortValue: 'AUserABC', href: null },
          { text: 'Accommodation', sortValue: 'accommodation', href: null },
        ]),
      ])
    })
  })
})
