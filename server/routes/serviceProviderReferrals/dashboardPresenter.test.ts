import DashboardPresenter from './dashboardPresenter'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import sentReferralFactory from '../../../testutils/factories/sentReferral'

describe(DashboardPresenter, () => {
  describe('tableHeadings', () => {
    it('returns the table’s headings', () => {
      const presenter = new DashboardPresenter([], [])

      expect(presenter.tableHeadings).toEqual([
        'Date received',
        'Referral',
        'Service user',
        'Intervention type',
        'Caseworker',
      ])
    })
  })

  describe('tableRows', () => {
    it('returns the table’s rows', () => {
      const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const sentReferrals = [
        sentReferralFactory.build({
          sentAt: '2021-01-26T13:00:00.000000Z',
          referenceNumber: 'ABCABCA1',
          referral: {
            serviceCategoryId: accommodationServiceCategory.id,
            serviceUser: { firstName: 'George', lastName: 'Michael' },
          },
        }),
        sentReferralFactory.build({
          sentAt: '2020-09-13T13:00:00.000000Z',
          referenceNumber: 'ABCABCA2',
          referral: {
            serviceCategoryId: socialInclusionServiceCategory.id,
            serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          },
        }),
      ]

      const presenter = new DashboardPresenter(sentReferrals, [
        accommodationServiceCategory,
        socialInclusionServiceCategory,
      ])

      expect(presenter.tableRows).toEqual([
        [
          { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
          { text: 'ABCABCA1', sortValue: null, href: `/service-provider/referrals/${sentReferrals[0].id}` },
          { text: 'George Michael', sortValue: 'michael, george', href: null },
          { text: 'Accommodation', sortValue: null, href: null },
          { text: '', sortValue: null, href: null },
        ],
        [
          { text: '13 Sep 2020', sortValue: '2020-09-13', href: null },
          { text: 'ABCABCA2', sortValue: null, href: `/service-provider/referrals/${sentReferrals[1].id}` },
          { text: 'Jenny Jones', sortValue: 'jones, jenny', href: null },
          { text: 'Social inclusion', sortValue: null, href: null },
          { text: '', sortValue: null, href: null },
        ],
      ])
    })

    describe('when a referral has been assigned to a caseworker', () => {
      it('includes the caseworker’s username', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const sentReferrals = [
          sentReferralFactory
            .assigned()
            .build({ assignedTo: { username: 'john.smith' }, referral: { serviceCategoryId: serviceCategory.id } }),
        ]

        const presenter = new DashboardPresenter(sentReferrals, [serviceCategory])

        expect(presenter.tableRows[0][4]).toEqual({ text: 'john.smith', sortValue: null, href: null })
      })
    })
  })
})
