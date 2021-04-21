import SentReferralFactory from '../../../testutils/factories/sentReferral'
import ServiceCategoryFactory from '../../../testutils/factories/serviceCategory'
import MyCasesPresenter from './myCasesPresenter'

describe('MyCasesPresenter', () => {
  const serviceCategories = [ServiceCategoryFactory.build({ id: '1' }), ServiceCategoryFactory.build({ id: '2' })]
  const referrals = [
    SentReferralFactory.assigned().build({
      referral: {
        serviceCategoryId: '1',
        serviceUser: {
          firstName: 'rob',
          lastName: 'shah-brookes',
        },
      },
    }),
    SentReferralFactory.unassigned().build({
      referral: {
        serviceCategoryId: '2',
        serviceUser: {
          firstName: 'HARDIP',
          lastName: 'fraiser',
        },
      },
    }),
    SentReferralFactory.assigned().build({
      referral: {
        serviceCategoryId: '1',
        serviceUser: {
          firstName: 'Jenny',
          lastName: 'Catherine',
        },
      },
    }),
  ]

  describe('tableRows', () => {
    it('returns a list of table rows with appropriate sort values', () => {
      const presenter = new MyCasesPresenter(referrals, serviceCategories)

      expect(presenter.tableRows).toEqual([
        expect.arrayContaining([
          { text: 'Rob Shah-Brookes', sortValue: 'shah-brookes, rob', href: null },
          { text: 'UserABC', sortValue: 'AUserABC', href: null },
          { text: 'accommodation', sortValue: 'accommodation', href: null },
        ]),
        expect.arrayContaining([
          { text: 'Hardip Fraiser', sortValue: 'fraiser, hardip', href: null },
          { text: 'Unassigned', sortValue: 'Unassigned', href: null },
          { text: 'accommodation', sortValue: 'accommodation', href: null },
        ]),
        expect.arrayContaining([
          { text: 'Jenny Catherine', sortValue: 'catherine, jenny', href: null },
          { text: 'UserABC', sortValue: 'AUserABC', href: null },
          { text: 'accommodation', sortValue: 'accommodation', href: null },
        ]),
      ])
    })
  })
})
