import sentReferralFactory from '../../testutils/factories/sentReferral'
import interventionFactory from '../../testutils/factories/intervention'
import serviceProviderSentReferralSummaryFactory from '../../testutils/factories/serviceProviderSentReferralSummary'
import pageFactory from '../../testutils/factories/page'

describe('Dashboards', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  describe('As a probation practitioner', () => {
    const accommodationIntervention = interventionFactory.build({
      title: 'Accommodation Services - West Midlands',
    })
    const womensServicesIntervention = interventionFactory.build({
      title: "Women's Services - West Midlands",
    })

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          interventionId: accommodationIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
        },
      }),
      sentReferralFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        assignedTo: {
          username: 'A. Caseworker',
          userId: '123',
          authSource: 'auth',
        },
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: womensServicesIntervention.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          serviceProvider: { name: 'Forward Solutions' },
        },
      }),
    ]

    beforeEach(() => {
      cy.task('stubProbationPractitionerToken')
      cy.task('stubProbationPractitionerAuthUser')

      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(sentReferrals).build())
    })

    describe('Viewing the dashboard page', () => {
      it('shows a list of sent referrals', () => {
        cy.login()

        cy.get('h1').contains('Open cases')

        cy.get('table')
          .getTable()
          .should('deep.equal', [
            {
              'Date sent': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Provider: 'Harmony Living',
              Caseworker: 'Unassigned',
              Action: 'View',
            },
            {
              'Date sent': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Provider: 'Forward Solutions',
              Caseworker: 'A. Caseworker',
              Action: 'View',
            },
          ])
      })

      describe('Selecting "Unassigned cases"', () => {
        it('should see "Unassigned cases"', () => {
          cy.login()
          cy.get('h1').contains('Open cases')
          cy.contains('Unassigned cases').click()
          cy.get('h1').contains('Unassigned cases')
          cy.get('table')
            .getTable()
            .should('deep.equal', [
              {
                'Date sent': '26 Jan 2021',
                Referral: 'ABCABCA1',
                'Service user': 'George Michael',
                'Intervention type': 'Accommodation Services - West Midlands',
                Provider: 'Harmony Living',
                Action: 'View',
              },
              {
                'Date sent': '13 Dec 2020',
                Referral: 'ABCABCA2',
                'Service user': 'Jenny Jones',
                'Intervention type': "Women's Services - West Midlands",
                Provider: 'Forward Solutions',
                Action: 'View',
              },
            ])
        })
      })

      describe('Selecting "Completed cases"', () => {
        it('should see "Completed cases"', () => {
          cy.login()
          cy.get('h1').contains('Open cases')
          cy.contains('Completed cases').click()
          cy.get('h1').contains('Completed cases')
          cy.get('table')
            .getTable()
            .should('deep.equal', [
              {
                'Date sent': '26 Jan 2021',
                Referral: 'ABCABCA1',
                'Service user': 'George Michael',
                'Intervention type': 'Accommodation Services - West Midlands',
                Provider: 'Harmony Living',
                Caseworker: 'Unassigned',
                Action: 'View',
              },
              {
                'Date sent': '13 Dec 2020',
                Referral: 'ABCABCA2',
                'Service user': 'Jenny Jones',
                'Intervention type': "Women's Services - West Midlands",
                Provider: 'Forward Solutions',
                Caseworker: 'A. Caseworker',
                Action: 'View',
              },
            ])
        })
      })

      describe('Selecting "Cancelled cases"', () => {
        it('should see "Cancelled cases"', () => {
          cy.login()
          cy.get('h1').contains('Open cases')
          cy.contains('Cancelled cases').click()
          cy.get('h1').contains('Cancelled cases')
          cy.get('table')
            .getTable()
            .should('deep.equal', [
              {
                'Date sent': '26 Jan 2021',
                Referral: 'ABCABCA1',
                'Service user': 'George Michael',
                'Intervention type': 'Accommodation Services - West Midlands',
                Provider: 'Harmony Living',
                Caseworker: 'Unassigned',
                Action: 'View',
              },
              {
                'Date sent': '13 Dec 2020',
                Referral: 'ABCABCA2',
                'Service user': 'Jenny Jones',
                'Intervention type': "Women's Services - West Midlands",
                Provider: 'Forward Solutions',
                Caseworker: 'A. Caseworker',
                Action: 'View',
              },
            ])
        })
      })
    })
  })

  describe('As a service provider', () => {
    const accommodationIntervention = interventionFactory.build({
      title: 'Accommodation Services - West Midlands',
    })
    const womensServicesIntervention = interventionFactory.build({
      title: "Women's Services - West Midlands",
    })

    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')

      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
    })

    describe('SP logs in and accesses "My cases"', () => {
      beforeEach(() => {
        const referralSummary = serviceProviderSentReferralSummaryFactory
          .withAssignedUser('USER1')
          .build({ referenceNumber: 'REFERRAL_REF' })
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([referralSummary])
        cy.login()
      })

      it('should see "My cases" with no Caseworker details', () => {
        cy.get('h1').contains('My cases')
        cy.get('table')
          .getTable()
          .should('deep.equal', [
            {
              'Date received': '26 Jan 2021',
              Referral: 'REFERRAL_REF',
              'Service user': 'Jenny Jones',
              'Intervention type': 'Social Inclusion - West Midlands',
              Action: 'View',
            },
          ])
      })

      describe('Selecting "All open cases"', () => {
        it('should see "All open cases" and Caseworker details', () => {
          cy.get('h1').contains('My cases')
          cy.contains('All open cases').click()
          cy.get('h1').contains('All open cases')
          cy.get('table')
            .getTable()
            .should('deep.equal', [
              {
                'Date received': '26 Jan 2021',
                Referral: 'REFERRAL_REF',
                'Service user': 'Jenny Jones',
                'Intervention type': 'Social Inclusion - West Midlands',
                Caseworker: 'USER1',
                Action: 'View',
              },
            ])
        })
      })

      describe('Selecting "Unassigned cases"', () => {
        it('should see "Unassigned cases" and no Caseworker details', () => {
          cy.get('h1').contains('My cases')
          cy.contains('Unassigned cases').click()
          cy.get('h1').contains('Unassigned cases')
          cy.get('table')
            .getTable()
            .should('deep.equal', [
              {
                'Date received': '26 Jan 2021',
                Referral: 'REFERRAL_REF',
                'Service user': 'Jenny Jones',
                'Intervention type': 'Social Inclusion - West Midlands',
                Action: 'View',
              },
            ])
        })
      })

      describe('Selecting "Completed cases"', () => {
        it('should see "Completed cases" and Caseworker details', () => {
          cy.get('h1').contains('My cases')
          cy.contains('Completed cases').click()
          cy.get('h1').contains('Completed cases')
          cy.get('table')
            .getTable()
            .should('deep.equal', [
              {
                'Date received': '26 Jan 2021',
                Referral: 'REFERRAL_REF',
                'Service user': 'Jenny Jones',
                'Intervention type': 'Social Inclusion - West Midlands',
                Caseworker: 'USER1',
                Action: 'View',
              },
            ])
        })
      })
    })

    describe('Sorting the table', () => {
      describe('with "Date received" as second order sort', () => {
        it('should order by "Date received" when first order values are identical', () => {
          const sentReferralsWithIdenticalReferenceNumber = [
            serviceProviderSentReferralSummaryFactory.withAssignedUser('USER1').build({
              sentAt: '2021-01-27T13:00:00.000000Z',
              referenceNumber: 'A',
            }),
            serviceProviderSentReferralSummaryFactory.withAssignedUser('USER1').build({
              sentAt: '2021-01-26T13:00:00.000000Z',
              referenceNumber: 'A',
            }),
            serviceProviderSentReferralSummaryFactory.withAssignedUser('USER1').build({
              sentAt: '2021-01-28T13:00:00.000000Z',
              referenceNumber: 'A',
            }),
            serviceProviderSentReferralSummaryFactory.withAssignedUser('USER1').build({
              sentAt: '2021-01-26T13:00:00.000000Z',
              referenceNumber: 'B',
            }),
          ]

          cy.stubGetServiceProviderSentReferralsSummaryForUserToken(sentReferralsWithIdenticalReferenceNumber)
          cy.login()

          cy.get('table')
            .getTable({ onlyColumns: ['Date received', 'Referral'] })
            .should('deep.equal', [
              {
                'Date received': '27 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '26 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '28 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '26 Jan 2021',
                Referral: 'B',
              },
            ])

          cy.get('table').within(() => cy.contains('button', 'Referral').click())
          cy.get('table')
            .getTable({ onlyColumns: ['Date received', 'Referral'] })
            .should('deep.equal', [
              {
                'Date received': '26 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '27 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '28 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '26 Jan 2021',
                Referral: 'B',
              },
            ])

          // Even when descending the first order column it should keep the Date received column ordered as ascending
          cy.get('table').within(() => cy.contains('button', 'Referral').click())
          cy.get('table')
            .getTable({ onlyColumns: ['Date received', 'Referral'] })
            .should('deep.equal', [
              {
                'Date received': '26 Jan 2021',
                Referral: 'B',
              },
              {
                'Date received': '26 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '27 Jan 2021',
                Referral: 'A',
              },
              {
                'Date received': '28 Jan 2021',
                Referral: 'A',
              },
            ])
        })
      })

      const assignedToSelfA = serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'A',
        interventionTitle: accommodationIntervention.title,
        serviceUserFirstName: 'Jenny',
        serviceUserLastName: 'Jones',
        assignedToUserName: 'USER1',
        endOfServiceReportSubmitted: false,
      })
      const assignedToSelfB = serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'B',
        interventionTitle: womensServicesIntervention.title,
        serviceUserFirstName: 'George',
        serviceUserLastName: 'Michael',
        assignedToUserName: 'USER1',
        endOfServiceReportSubmitted: false,
      })
      const unassignedA = serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'A',
        interventionTitle: accommodationIntervention.title,
        serviceUserFirstName: 'Jenny',
        serviceUserLastName: 'Jones',
        assignedToUserName: '',
        endOfServiceReportSubmitted: false,
      })
      const unassignedB = serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'B',
        interventionTitle: womensServicesIntervention.title,
        serviceUserFirstName: 'George',
        serviceUserLastName: 'Michael',
        assignedToUserName: '',
        endOfServiceReportSubmitted: false,
      })
      const completedA = serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'A',
        interventionTitle: accommodationIntervention.title,
        serviceUserFirstName: 'Jenny',
        serviceUserLastName: 'Jones',
        assignedToUserName: 'USER1',
        endOfServiceReportSubmitted: true,
      })
      const completedB = serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'B',
        interventionTitle: womensServicesIntervention.title,
        serviceUserFirstName: 'George',
        serviceUserLastName: 'Michael',
        assignedToUserName: 'USER1',
        endOfServiceReportSubmitted: true,
      })

      const rowForReferralAWithNoCaseworkerColumn = {
        'Date received': '13 Dec 2020',
        Referral: 'A',
        'Service user': 'Jenny Jones',
        'Intervention type': 'Accommodation Services - West Midlands',
        Action: 'View',
      }
      const rowForReferralBWithNoCaseworkerColumn = {
        'Date received': '26 Jan 2021',
        Referral: 'B',
        'Service user': 'George Michael',
        'Intervention type': "Women's Services - West Midlands",
        Action: 'View',
      }

      const rowForReferralAWithCaseworker = {
        'Date received': '13 Dec 2020',
        Referral: 'A',
        'Service user': 'Jenny Jones',
        'Intervention type': 'Accommodation Services - West Midlands',
        Caseworker: 'USER1',
        Action: 'View',
      }

      const rowForReferralBWithCaseworker = {
        'Date received': '26 Jan 2021',
        Referral: 'B',
        'Service user': 'George Michael',
        'Intervention type': "Women's Services - West Midlands",
        Caseworker: 'USER1',
        Action: 'View',
      }

      const dashBoardTables = [
        {
          dashboardType: 'My cases',
          referrals: [assignedToSelfA, assignedToSelfB],
          initialTable: [rowForReferralAWithNoCaseworkerColumn, rowForReferralBWithNoCaseworkerColumn],
          sortedTable: [rowForReferralAWithNoCaseworkerColumn, rowForReferralBWithNoCaseworkerColumn],
          sortedTables: [
            {
              header: 'Date received',
            },
          ],
        },
        {
          dashboardType: 'All open cases',
          referrals: [assignedToSelfA, assignedToSelfB],
          initialTable: [rowForReferralAWithCaseworker, rowForReferralBWithCaseworker],
          sortedTable: [rowForReferralAWithCaseworker, rowForReferralBWithCaseworker],
        },
        {
          dashboardType: 'Unassigned cases',
          referrals: [unassignedA, unassignedB],
          initialTable: [rowForReferralAWithNoCaseworkerColumn, rowForReferralBWithNoCaseworkerColumn],
          sortedTable: [rowForReferralAWithNoCaseworkerColumn, rowForReferralBWithNoCaseworkerColumn],
        },
        {
          dashboardType: 'Completed cases',
          referrals: [completedA, completedB],
          initialTable: [rowForReferralAWithCaseworker, rowForReferralBWithCaseworker],
          sortedTable: [rowForReferralAWithCaseworker, rowForReferralBWithCaseworker],
        },
      ]

      const referralToSelect = sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'B',
        referral: {
          interventionId: accommodationIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
        },
      })

      dashBoardTables.forEach(({ dashboardType, referrals, initialTable, sortedTable }) => {
        describe(`sorting by "Date received" for dashboard "${dashboardType}"`, () => {
          beforeEach(() => {
            cy.stubGetServiceProviderSentReferralsSummaryForUserToken(referrals)
          })

          it(`allows the user to sort by "Date received" for dashboard "${dashboardType}"`, () => {
            cy.login()
            cy.contains(dashboardType).click()

            cy.get('table').getTable().should('deep.equal', initialTable)

            cy.get('table').within(() => cy.contains('button', 'Date received').click())
            cy.get('table').getTable().should('deep.equal', sortedTable)

            cy.get('table').within(() => cy.contains('button', 'Date received').click())

            const reversedTable = [...sortedTable].reverse()
            cy.get('table').getTable().should('deep.equal', reversedTable)
          })

          it(`persists the sort order when coming back to the page for dashboard "${dashboardType}"`, () => {
            cy.login()
            cy.contains(dashboardType).click()

            cy.get('table').within(() => cy.contains('button', 'Date received').click())
            cy.get('table').getTable().should('deep.equal', sortedTable)

            cy.stubViewReferralDetails(referralToSelect)

            cy.visit(`/service-provider/referrals/${referralToSelect.id}/details`)
            cy.contains('Back').click()
            cy.contains(dashboardType).click()

            // Wait for header sort button to load, as it means JS has run
            cy.get('table').within(() => cy.contains('button', 'Date received'))
            cy.get('table').getTable().should('deep.equal', sortedTable)
          })
        })
      })
    })
  })
})
