import sentReferralDashboardFactory from '../../testutils/factories/sentReferralForDashboard'
import interventionFactory from '../../testutils/factories/intervention'
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
      sentReferralDashboardFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        assignedTo: null,
        serviceUser: { firstName: 'George', lastName: 'Michael' },
      }),
      sentReferralDashboardFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        assignedTo: {
          username: 'A. Caseworker',
          userId: '123',
          authSource: 'auth',
        },
        referenceNumber: 'ABCABCA2',
        serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
        serviceProvider: { name: 'Forward Solutions' },
        interventionTitle: "Women's Services - West Midlands",
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
              Person: 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Provider: 'Harmony Living',
              Caseworker: 'Unassigned',
              Action: 'View',
            },
            {
              'Date sent': '13 Dec 2020',
              Referral: 'ABCABCA2',
              Person: 'Jenny Jones',
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
                Person: 'George Michael',
                'Intervention type': 'Accommodation Services - West Midlands',
                Provider: 'Harmony Living',
                Action: 'View',
              },
              {
                'Date sent': '13 Dec 2020',
                Referral: 'ABCABCA2',
                Person: 'Jenny Jones',
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
                Person: 'George Michael',
                'Intervention type': 'Accommodation Services - West Midlands',
                Provider: 'Harmony Living',
                Caseworker: 'Unassigned',
                Action: 'View',
              },
              {
                'Date sent': '13 Dec 2020',
                Referral: 'ABCABCA2',
                Person: 'Jenny Jones',
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
                Person: 'George Michael',
                'Intervention type': 'Accommodation Services - West Midlands',
                Provider: 'Harmony Living',
                Caseworker: 'Unassigned',
                Action: 'View',
              },
              {
                'Date sent': '13 Dec 2020',
                Referral: 'ABCABCA2',
                Person: 'Jenny Jones',
                'Intervention type': "Women's Services - West Midlands",
                Provider: 'Forward Solutions',
                Caseworker: 'A. Caseworker',
                Action: 'View',
              },
            ])
        })
      })
    })

    describe('table sort headings', () => {
      it('should show which column the table is currently sorted by', () => {
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
        cy.login()

        const headings = ['Date sent', 'Referral', 'Person', 'Intervention type', 'Provider']
        headings.forEach(heading => {
          cy.get('table').within(() => cy.contains('button', heading).click())

          // check the clicked heading is sorted and all others are not
          cy.get('thead')
            .find('th')
            .each($el => {
              const sort = $el.text() === heading ? 'ascending' : 'none'
              cy.wrap($el).should('have.attr', { 'aria-sort': sort })
            })

          // clicking again sorts in the other direction
          cy.get('table').within(() => cy.contains('button', heading).click())
          cy.get('table').within(() =>
            cy.contains('button', heading).should('have.attr', { 'aria-sort': 'descending' })
          )
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

    const sentReferrals = [
      sentReferralDashboardFactory.assigned().build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'REFERRAL_REF',
        serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      }),
    ]

    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')

      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
    })

    describe('SP logs in and accesses "My cases"', () => {
      beforeEach(() => {
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(sentReferrals).build())
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
              Person: 'Jenny Jones',
              'Intervention type': 'Accommodation Services - West Midlands',
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
                Person: 'Jenny Jones',
                'Intervention type': 'Accommodation Services - West Midlands',
                Caseworker: 'UserABC',
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
                Person: 'Jenny Jones',
                'Intervention type': 'Accommodation Services - West Midlands',
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
                Person: 'Jenny Jones',
                'Intervention type': 'Accommodation Services - West Midlands',
                Caseworker: 'UserABC',
                Action: 'View',
              },
            ])
        })
      })
    })

    describe('table sort headings', () => {
      it('should show which column the table is currently sorted by', () => {
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
        cy.login()

        const headings = ['Date received', 'Referral', 'Person', 'Intervention type']
        headings.forEach(heading => {
          cy.get('table').within(() => cy.contains('button', heading).click())

          // check the clicked heading is sorted and all others are not
          cy.get('thead')
            .find('th')
            .each($el => {
              const sort = $el.text() === heading ? 'ascending' : 'none'
              cy.wrap($el).should('have.attr', { 'aria-sort': sort })
            })

          // clicking again sorts in the other direction
          cy.get('table').within(() => cy.contains('button', heading).click())
          cy.get('table').within(() =>
            cy.contains('button', heading).should('have.attr', { 'aria-sort': 'descending' })
          )
        })
      })

      const dashBoardTables = [
        {
          dashboardType: 'My cases',
          sortField: 'Date received',
        },
        {
          dashboardType: 'All open cases',
          sortField: 'Intervention type',
        },
        {
          dashboardType: 'Unassigned cases',
          sortField: 'Person',
        },
        {
          dashboardType: 'Completed cases',
          sortField: 'Referral',
        },
      ]

      dashBoardTables.forEach(table => {
        it(`persists the sort order when coming back to the page for dashboard "${table.dashboardType}"`, () => {
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
          cy.login()

          cy.contains(table.dashboardType).click()

          cy.get('table').within(() => cy.contains('button', table.sortField).click())
          cy.get('table').within(() =>
            cy.contains('button', table.sortField).should('have.attr', { 'aria-sort': 'ascending' })
          )

          cy.contains(table.dashboardType).click()

          // Wait for header sort button to load, as it means JS has run
          cy.get('table').within(() => cy.contains('button', table.sortField))
          cy.get('table').within(() =>
            cy.contains('button', table.sortField).should('have.attr', { 'aria-sort': 'ascending' })
          )
        })
      })
    })
  })
})
