import DashboardPresenter, { DashboardType } from './dashboardPresenter'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'
import pageFactory from '../../../testutils/factories/page'
import { Page } from '../../models/pagination'
import SentReferralForDashboardFactory from '../../../testutils/factories/sentReferralForDashboard'
import SentReferralDashboard from '../../models/sentReferralDashboard'

describe(DashboardPresenter, () => {
  const loggedInUser = loggedInUserFactory.crsServiceProviderUser().build()

  const referrals = [
    SentReferralForDashboardFactory.assigned().build({
      id: '1',
      sentAt: '2021-01-26T13:00:00.000000Z',
      referenceNumber: 'ABCABCA1',
      serviceUser: {
        firstName: 'rob',
        lastName: 'shah-brookes',
      },
    }),
    SentReferralForDashboardFactory.unassigned().build({
      id: '2',
      sentAt: '2020-10-14T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      serviceUser: {
        firstName: 'HARDIP',
        lastName: 'fraiser',
      },
      interventionTitle: "Women's Services - West Midlands",
    }),
    SentReferralForDashboardFactory.assigned().build({
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
      const page = pageFactory.pageContent([]).build() as Page<SentReferralDashboard>
      const presenter = new DashboardPresenter(page, 'My cases', loggedInUser, 'tableId', 'sentAt,DESC')
      expect(presenter.tableHeadings.map(headers => headers.persistentId)).toEqual([
        'sentAt',
        'referenceNumber',
        'serviceUserData.lastName',
        'intervention.title',
        null,
      ])
    })
  })

  describe('tableRows', () => {
    const displayCaseworkerDashboardTypes: DashboardType[] = ['All open cases', 'Completed cases']
    describe.each(displayCaseworkerDashboardTypes)('with %s dashboard type', dashboardType => {
      it('returns the table’s rows', () => {
        const page = pageFactory.pageContent(referrals).build() as Page<SentReferralDashboard>

        const presenter = new DashboardPresenter(page, dashboardType, loggedInUser, 'tableId', 'sentAt,DESC')

        expect(presenter.tableRows).toEqual([
          [
            { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
            { text: 'ABCABCA1', sortValue: null, href: null },
            { text: 'Rob Shah-Brookes', sortValue: 'shah-brookes, rob', href: null },
            { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
            { text: 'UserABC', sortValue: null, href: null },
            {
              text: 'View',
              sortValue: null,
              href: '/service-provider/referrals/1/progress',
            },
          ],
          [
            { text: '14 Oct 2020', sortValue: '2020-10-14', href: null },
            { text: 'ABCABCA2', sortValue: null, href: null },
            { text: 'Hardip Fraiser', sortValue: 'fraiser, hardip', href: null },
            { text: "Women's Services - West Midlands", sortValue: null, href: null },
            { text: '', sortValue: null, href: null },
            {
              text: 'View',
              sortValue: null,
              href: '/service-provider/referrals/2/details',
            },
          ],
          [
            { text: '13 Oct 2020', sortValue: '2020-10-13', href: null },
            { text: 'ABCABCA3', sortValue: null, href: null },
            { text: 'Jenny Catherine', sortValue: 'catherine, jenny', href: null },
            {
              text: 'Accommodation Services - West Midlands',
              sortValue: null,
              href: null,
            },
            { text: 'UserABC', sortValue: null, href: null },
            {
              text: 'View',
              sortValue: null,
              href: '/service-provider/referrals/3/progress',
            },
          ],
        ])
      })

      describe('when a referral has been assigned to a caseworker', () => {
        it('includes the caseworker’s username', () => {
          const page = pageFactory.pageContent(referrals).build() as Page<SentReferralDashboard>
          const presenter = new DashboardPresenter(page, dashboardType, loggedInUser, 'tableId', 'sentAt,DESC')

          expect(presenter.tableRows[0][4]).toMatchObject({ text: 'UserABC' })
        })
      })
    })

    const dontDisplayCaseworkerDashboardTypes: DashboardType[] = ['My cases', 'Unassigned cases']
    describe.each(dontDisplayCaseworkerDashboardTypes)('with %s dashboard type', dashboardType => {
      it('does not display the case worker column', () => {
        const page = pageFactory.pageContent(referrals).build() as Page<SentReferralDashboard>
        const presenter = new DashboardPresenter(page, dashboardType, loggedInUser, 'tableId', 'sentAt,DESC')

        expect(presenter.tableRows).toEqual([
          [
            { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
            { text: 'ABCABCA1', sortValue: null, href: null },
            { text: 'Rob Shah-Brookes', sortValue: 'shah-brookes, rob', href: null },
            { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
            { text: 'View', sortValue: null, href: `/service-provider/referrals/1/progress` },
          ],
          [
            { text: '14 Oct 2020', sortValue: '2020-10-14', href: null },
            { text: 'ABCABCA2', sortValue: null, href: null },
            { text: 'Hardip Fraiser', sortValue: 'fraiser, hardip', href: null },
            { text: "Women's Services - West Midlands", sortValue: null, href: null },
            { text: 'View', sortValue: null, href: '/service-provider/referrals/2/details' },
          ],
          [
            { text: '13 Oct 2020', sortValue: '2020-10-13', href: null },
            { text: 'ABCABCA3', sortValue: null, href: null },
            { text: 'Jenny Catherine', sortValue: 'catherine, jenny', href: null },
            { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
            { text: 'View', sortValue: null, href: '/service-provider/referrals/3/progress' },
          ],
        ])
      })
    })
  })

  describe('the View link', () => {
    describe('when a referral has been assigned to a caseworker', () => {
      it('links to the intervention progress page', () => {
        const page = pageFactory.pageContent(referrals).build() as Page<SentReferralDashboard>
        const presenter = new DashboardPresenter(page, 'All open cases', loggedInUser, 'tableId', 'sentAt,DESC')

        expect(presenter.tableRows[0][5]).toMatchObject({
          href: `/service-provider/referrals/1/progress`,
        })
      })
    })
  })
})
