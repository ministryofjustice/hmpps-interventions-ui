import DashboardPresenter, { DashboardType } from './dashboardPresenter'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'
import pageFactory from '../../../testutils/factories/page'
import { Page } from '../../models/pagination'
import SentReferralSummariesFactory from '../../../testutils/factories/sentReferralSummaries'
import SentReferralSummaries from '../../models/sentReferralSummaries'
import prisonFactory from '../../../testutils/factories/prison'

describe(DashboardPresenter, () => {
  const loggedInUser = loggedInUserFactory.crsServiceProviderUser().build()

  const referrals = [
    SentReferralSummariesFactory.assigned().build({
      id: '1',
      sentAt: '2021-01-26T13:00:00.000000Z',
      referenceNumber: 'ABCABCA1',
      serviceUser: {
        firstName: 'rob',
        lastName: 'shah-brookes',
      },
      expectedReleaseDate: '2023-07-29',
      location: 'aaa',
      locationType: 'CUSTODY',
    }),
    SentReferralSummariesFactory.unassigned().build({
      id: '2',
      sentAt: '2020-10-14T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      serviceUser: {
        firstName: 'HARDIP',
        lastName: 'fraiser',
      },
      interventionTitle: "Women's Services - West Midlands",
    }),
    SentReferralSummariesFactory.assigned().build({
      id: '3',
      sentAt: '2020-10-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA3',
      serviceUser: {
        firstName: 'Jenny',
        lastName: 'Catherine',
      },
    }),
  ]

  describe('tableHeadings', () => {
    it('persistentId is the database sort field', () => {
      const page = pageFactory.pageContent([]).build() as Page<SentReferralSummaries>
      const prisons = prisonFactory.prisonList()
      const presenter = new DashboardPresenter(
        page,
        'My cases',
        loggedInUser,
        'tableId',
        'sentAt,DESC',
        true,
        'abc',
        prisons
      )
      expect(presenter.tableHeadings.map(headers => headers.persistentId)).toEqual([
        'serviceUserData.lastName',
        'referenceNumber',
        'intervention.title',
        'sentAt',
      ])
    })
  })

  describe('tableRows', () => {
    const displayCaseworkerDashboardTypes: DashboardType[] = ['All open cases', 'Completed cases']
    describe.each(displayCaseworkerDashboardTypes)('with %s dashboard type', dashboardType => {
      it('returns the table’s rows', () => {
        const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>
        const prisons = prisonFactory.prisonList()

        const presenter = new DashboardPresenter(
          page,
          dashboardType,
          loggedInUser,
          'tableId',
          'sentAt,DESC',
          true,
          'abc',
          prisons
        )

        expect(presenter.tableRows).toEqual([
          [
            {
              text: 'Rob Shah-Brookes:X123456',
              sortValue: 'shah-brookes, rob',
              href: '/service-provider/referrals/1/progress',
              doubleCell: true,
            },
            { text: 'ABCABCA1', sortValue: null, href: null },
            { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
            { text: 'UserABC', sortValue: 'UserABC', href: null },
            { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
          ],
          [
            {
              text: 'Hardip Fraiser:X123456',
              sortValue: 'fraiser, hardip',
              href: '/service-provider/referrals/2/details',
              doubleCell: true,
            },
            { text: 'ABCABCA2', sortValue: null, href: null },
            {
              text: "Women's Services - West Midlands",
              sortValue: null,
              href: null,
            },
            { text: '', sortValue: 'Unassigned', href: null },
            { text: '14 Oct 2020', sortValue: '2020-10-14', href: null },
          ],
          [
            {
              text: 'Jenny Catherine:X123456',
              sortValue: 'catherine, jenny',
              href: '/service-provider/referrals/3/progress',
              doubleCell: true,
            },
            { text: 'ABCABCA3', sortValue: null, href: null },
            {
              text: 'Accommodation Services - West Midlands',
              sortValue: null,
              href: null,
            },
            { text: 'UserABC', sortValue: 'UserABC', href: null },
            { text: '13 Oct 2020', sortValue: '2020-10-13', href: null },
          ],
        ])
      })

      describe('when a referral has been assigned to a caseworker', () => {
        it('includes the caseworker’s username', () => {
          const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>
          const prisons = prisonFactory.prisonList()
          const presenter = new DashboardPresenter(
            page,
            dashboardType,
            loggedInUser,
            'tableId',
            'sentAt,DESC',
            true,
            'abc',
            prisons
          )

          expect(presenter.tableRows[0][3]).toMatchObject({ text: 'UserABC' })
        })
      })
    })

    const dontDisplayCaseworkerDashboardTypes: DashboardType[] = ['My cases', 'Unassigned cases']
    describe.each(dontDisplayCaseworkerDashboardTypes)('with %s dashboard type', dashboardType => {
      it('does not display the case worker column', () => {
        const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>
        const prisons = prisonFactory.prisonList()
        const presenter = new DashboardPresenter(
          page,
          dashboardType,
          loggedInUser,
          'tableId',
          'sentAt,DESC',
          true,
          'abc',
          prisons
        )

        if (dashboardType === 'Unassigned cases') {
          expect(presenter.tableRows).toEqual([
            [
              {
                text: 'Rob Shah-Brookes:X123456',
                sortValue: 'shah-brookes, rob',
                href: '/service-provider/referrals/1/progress',
                doubleCell: true,
              },
              { text: '29 Jul 2023', sortValue: null, href: null },
              { text: 'London', sortValue: null, href: null },
              { text: 'ABCABCA1', sortValue: null, href: null },
              { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
              { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
            ],
            [
              {
                text: 'Hardip Fraiser:X123456',
                sortValue: 'fraiser, hardip',
                href: '/service-provider/referrals/2/details',
                doubleCell: true,
              },
              { text: 'N/A', sortValue: null, href: null },
              { text: 'London', sortValue: null, href: null },
              { text: 'ABCABCA2', sortValue: null, href: null },
              {
                text: "Women's Services - West Midlands",
                sortValue: null,
                href: null,
              },
              { text: '14 Oct 2020', sortValue: '2020-10-14', href: null },
            ],
            [
              {
                text: 'Jenny Catherine:X123456',
                sortValue: 'catherine, jenny',
                href: '/service-provider/referrals/3/progress',
                doubleCell: true,
              },
              { text: 'N/A', sortValue: null, href: null },
              { text: 'London', sortValue: null, href: null },
              { text: 'ABCABCA3', sortValue: null, href: null },
              {
                text: 'Accommodation Services - West Midlands',
                sortValue: null,
                href: null,
              },
              { text: '13 Oct 2020', sortValue: '2020-10-13', href: null },
            ],
          ])
        } else {
          expect(presenter.tableRows).toEqual([
            [
              {
                text: 'Rob Shah-Brookes:X123456',
                sortValue: 'shah-brookes, rob',
                href: '/service-provider/referrals/1/progress',
                doubleCell: true,
              },
              { text: 'ABCABCA1', sortValue: null, href: null },
              { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
              { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
            ],
            [
              {
                text: 'Hardip Fraiser:X123456',
                sortValue: 'fraiser, hardip',
                href: '/service-provider/referrals/2/details',
                doubleCell: true,
              },
              { text: 'ABCABCA2', sortValue: null, href: null },
              {
                text: "Women's Services - West Midlands",
                sortValue: null,
                href: null,
              },
              { text: '14 Oct 2020', sortValue: '2020-10-14', href: null },
            ],
            [
              {
                text: 'Jenny Catherine:X123456',
                sortValue: 'catherine, jenny',
                href: '/service-provider/referrals/3/progress',
                doubleCell: true,
              },
              { text: 'ABCABCA3', sortValue: null, href: null },
              {
                text: 'Accommodation Services - West Midlands',
                sortValue: null,
                href: null,
              },
              { text: '13 Oct 2020', sortValue: '2020-10-13', href: null },
            ],
          ])
        }
      })
    })
  })
})
