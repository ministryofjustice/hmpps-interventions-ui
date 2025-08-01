import SentReferralSummariesFactory from '../../../testutils/factories/sentReferralSummaries'
import DashboardPresenter from './dashboardPresenter'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'
import pageFactory from '../../../testutils/factories/page'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import { Page } from '../../models/pagination'

import SentReferralSummaries from '../../models/sentReferralSummaries'

describe('DashboardPresenter', () => {
  const referrals = [
    SentReferralSummariesFactory.assigned().build({
      id: '1',
      sentAt: '2021-01-26T13:00:00.000000Z',
      referenceNumber: 'ABCABCA1',
      serviceUser: {
        firstName: 'rob',
        lastName: 'shah-brookes',
      },
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

  const loggedInUser = loggedInUserFactory.probationUser().build()

  describe('tableRows', () => {
    it('returns a list of table rows with appropriate sort values for Open cases', () => {
      const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>
      const presenter = new DashboardPresenter(
        page,
        loggedInUser,
        'Open cases',
        'ppOpenCases',
        'sentAt,ASC',
        false,
        'abc',
        []
      )

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
          { text: 'UserABC', sortValue: 'UserABC', href: null },
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
          { text: 'UserABC', sortValue: 'UserABC', href: null },
          {
            text: 'View',
            sortValue: null,
            href: '/probation-practitioner/referrals/3/progress',
          },
        ],
      ])
    })

    it('returns a list of table rows for Draft cases', () => {
      const referral1 = draftReferralFactory.build({
        serviceUser: { firstName: 'Alice', lastName: 'Smith', crn: 'CRN1' },
        serviceProvider: { name: 'Provider1', id: 'sp1' },
        contractTypeName: 'Intervention X',
        createdAt: '2022-02-01T10:00:00.000Z',
      })

      const referral2 = draftReferralFactory.build({
        serviceUser: { firstName: 'Bob', lastName: 'Jones', crn: 'CRN2' },
        serviceProvider: { name: 'Provider2', id: 'sp2' },
        contractTypeName: 'Intervention Y',
        createdAt: '2022-01-01T10:00:00.000Z',
      })
      const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>
      const presenter = new DashboardPresenter(
        page, // as Page<DraftReferralSummary>
        loggedInUser,
        'Draft cases',
        'ppDraftCases',
        '',
        false,
        'abc',
        [referral1, referral2]
      )

      expect(presenter.tableRowsForDrafts).toEqual([
        [
          { text: 'Alice Smith', sortValue: null, href: '/referrals/1/community-allocated-form' },
          { text: 'Provider1', sortValue: null, href: null },
          { text: 'Intervention X', sortValue: null, href: null },
          { text: '1 Feb 2022', sortValue: null, href: null },
        ],
        [
          { text: 'Bob Jones', sortValue: null, href: '/referrals/2/community-allocated-form' },
          { text: 'Provider2', sortValue: null, href: null },
          { text: 'Intervention Y', sortValue: null, href: null },
          { text: '1 Jan 2022', sortValue: null, href: null },
        ],
      ])
    })
  })
})
