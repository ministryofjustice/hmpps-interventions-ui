import DashboardPresenter, { DashboardType } from './dashboardPresenter'
import ServiceProviderSentReferralSummary from '../../models/serviceProviderSentReferralSummary'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'

describe(DashboardPresenter, () => {
  const loggedInUser = loggedInUserFactory.crsServiceProviderUser().build()

  describe('tableHeadings', () => {
    it('incorporates dashboard type name into persistent id', () => {
      const presenter = new DashboardPresenter([], 'My cases', loggedInUser)
      expect(presenter.tableHeadings.map(headers => headers.persistentId)).toEqual([
        'MycasesDateReceived',
        'MycasesReferenceNumber',
        'MycasesServiceUser',
        'MycasesInterventionType',
        'MycasesAction',
      ])
    })
  })

  describe('tableRows', () => {
    const displayCaseworkerDashboardTypes: DashboardType[] = ['All open cases', 'Completed cases']
    describe.each(displayCaseworkerDashboardTypes)('with %s dashboard type', dashboardType => {
      it('returns the table’s rows', () => {
        const referralsSummary: ServiceProviderSentReferralSummary[] = [
          {
            referralId: '1',
            sentAt: '2021-01-26T13:00:00.000000Z',
            referenceNumber: 'ABCABCA1',
            interventionTitle: 'Accommodation Services - West Midlands',
            assignedToUserName: null,
            serviceUserFirstName: 'George',
            serviceUserLastName: 'Michael',
          },
          {
            referralId: '2',
            sentAt: '2020-10-13T13:00:00.000000Z',
            referenceNumber: 'ABCABCA2',
            interventionTitle: "Women's Services - West Midlands",
            assignedToUserName: null,
            serviceUserFirstName: 'Jenny',
            serviceUserLastName: 'Jones',
          },
        ]

        const presenter = new DashboardPresenter(referralsSummary, dashboardType, loggedInUser)

        expect(presenter.tableRows).toEqual([
          [
            { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
            { text: 'ABCABCA1', sortValue: null, href: null },
            { text: 'George Michael', sortValue: 'michael, george', href: null },
            { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
            { text: '', sortValue: null, href: null },
            { text: 'View', sortValue: null, href: `/service-provider/referrals/1/details` },
          ],
          [
            { text: '13 Oct 2020', sortValue: '2020-10-13', href: null },
            { text: 'ABCABCA2', sortValue: null, href: null },
            { text: 'Jenny Jones', sortValue: 'jones, jenny', href: null },
            { text: "Women's Services - West Midlands", sortValue: null, href: null },
            { text: '', sortValue: null, href: null },
            { text: 'View', sortValue: null, href: `/service-provider/referrals/2/details` },
          ],
        ])
      })

      describe('when a referral has been assigned to a caseworker', () => {
        it('includes the caseworker’s username', () => {
          const referralsSummary: ServiceProviderSentReferralSummary[] = [
            {
              referralId: '1',
              sentAt: '2021-01-26T13:00:00.000000Z',
              referenceNumber: 'ABCABCA1',
              interventionTitle: 'Accommodation Services - West Midlands',
              assignedToUserName: 'john.smith',
              serviceUserFirstName: 'George',
              serviceUserLastName: 'Michael',
            },
          ]
          const presenter = new DashboardPresenter(referralsSummary, dashboardType, loggedInUser)

          expect(presenter.tableRows[0][4]).toMatchObject({ text: 'john.smith' })
        })
      })
    })

    const dontDisplayCaseworkerDashboardTypes: DashboardType[] = ['My cases', 'Unassigned cases']
    describe.each(dontDisplayCaseworkerDashboardTypes)('with %s dashboard type', dashboardType => {
      it('does not display the case worker column', () => {
        const referralsSummary: ServiceProviderSentReferralSummary[] = [
          {
            referralId: '1',
            sentAt: '2021-01-26T13:00:00.000000Z',
            referenceNumber: 'ABCABCA1',
            interventionTitle: 'Accommodation Services - West Midlands',
            assignedToUserName: 'john.smith',
            serviceUserFirstName: 'George',
            serviceUserLastName: 'Michael',
          },
        ]
        const presenter = new DashboardPresenter(referralsSummary, dashboardType, loggedInUser)

        expect(presenter.tableRows).toEqual([
          [
            { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
            { text: 'ABCABCA1', sortValue: null, href: null },
            { text: 'George Michael', sortValue: 'michael, george', href: null },
            { text: 'Accommodation Services - West Midlands', sortValue: null, href: null },
            { text: 'View', sortValue: null, href: `/service-provider/referrals/1/progress` },
          ],
        ])
      })
    })
  })

  describe('the View link', () => {
    describe('when a referral has been assigned to a caseworker', () => {
      it('links to the intervention progress page', () => {
        const referralsSummary: ServiceProviderSentReferralSummary[] = [
          {
            referralId: '1',
            sentAt: '2021-01-26T13:00:00.000000Z',
            referenceNumber: 'ABCABCA1',
            interventionTitle: 'Accommodation Services - West Midlands',
            assignedToUserName: 'john.smith',
            serviceUserFirstName: 'George',
            serviceUserLastName: 'Michael',
          },
        ]
        const presenter = new DashboardPresenter(referralsSummary, 'All open cases', loggedInUser)

        expect(presenter.tableRows[0][5]).toMatchObject({
          href: `/service-provider/referrals/1/progress`,
        })
      })
    })
  })
})
