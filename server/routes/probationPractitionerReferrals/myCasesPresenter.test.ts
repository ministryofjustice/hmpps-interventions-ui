import interventionFactory from '../../../testutils/factories/intervention'
import SentReferralFactory from '../../../testutils/factories/sentReferral'
import MyCasesPresenter from './myCasesPresenter'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'

describe('MyCasesPresenter', () => {
  const interventions = [
    interventionFactory.build({ id: '1', title: 'Accommodation Services - West Midlands' }),
    interventionFactory.build({ id: '2', title: "Women's Services - West Midlands" }),
  ]
  const referrals = [
    SentReferralFactory.assigned().build({
      id: '1',
      sentAt: '2021-01-26T13:00:00.000000Z',
      referenceNumber: 'ABCABCA1',
      referral: {
        interventionId: '1',
        serviceUser: {
          firstName: 'rob',
          lastName: 'shah-brookes',
        },
      },
    }),
    SentReferralFactory.unassigned().build({
      id: '2',
      sentAt: '2020-10-14T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: '2',
        serviceUser: {
          firstName: 'HARDIP',
          lastName: 'fraiser',
        },
      },
    }),
    SentReferralFactory.assigned().build({
      id: '3',
      sentAt: '2020-10-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA3',
      referral: {
        interventionId: '1',
        serviceUser: {
          firstName: 'Jenny',
          lastName: 'Catherine',
        },
      },
    }),
  ]

  const loggedInUser = loggedInUserFactory.probationUser().build()

  describe('tableRows', () => {
    it('returns a list of table rows with appropriate sort values', () => {
      const presenter = new MyCasesPresenter(referrals, interventions, loggedInUser)

      expect(presenter.tableRows).toEqual([
        [
          { text: '26 Jan 2021', sortValue: '2021-01-26', href: null },
          { text: 'ABCABCA1', sortValue: 'ABCABCA1', href: null },
          { text: 'Rob Shah-Brookes', sortValue: 'shah-brookes, rob', href: null },
          {
            text: 'Accommodation Services - West Midlands',
            sortValue: null,
            href: null,
          },
          { text: 'Harmony Living', sortValue: 'Harmony Living', href: null },
          { text: 'UserABC', sortValue: 'AUserABC', href: null },
          {
            text: 'View',
            sortValue: null,
            href: '/probation-practitioner/referrals/1/progress',
          },
        ],
        [
          { text: '14 Oct 2020', sortValue: '2020-10-14', href: null },
          { text: 'ABCABCA2', sortValue: 'ABCABCA2', href: null },
          { text: 'Hardip Fraiser', sortValue: 'fraiser, hardip', href: null },
          { text: "Women's Services - West Midlands", sortValue: null, href: null },
          { text: 'Harmony Living', sortValue: 'Harmony Living', href: null },
          { text: 'Unassigned', sortValue: 'Unassigned', href: null },
          {
            text: 'View',
            sortValue: null,
            href: '/probation-practitioner/referrals/2/progress',
          },
        ],
        [
          { text: '13 Oct 2020', sortValue: '2020-10-13', href: null },
          { text: 'ABCABCA3', sortValue: 'ABCABCA3', href: null },
          { text: 'Jenny Catherine', sortValue: 'catherine, jenny', href: null },
          {
            text: 'Accommodation Services - West Midlands',
            sortValue: null,
            href: null,
          },
          { text: 'Harmony Living', sortValue: 'Harmony Living', href: null },
          { text: 'UserABC', sortValue: 'AUserABC', href: null },
          {
            text: 'View',
            sortValue: null,
            href: '/probation-practitioner/referrals/3/progress',
          },
        ],
      ])
    })
  })
})
