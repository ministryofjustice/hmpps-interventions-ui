import sentReferralSummaries from '../../testutils/factories/sentReferralSummaries'
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
      sentReferralSummaries.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        assignedTo: null,
        serviceUser: { firstName: 'George', lastName: 'Michael' },
      }),
      sentReferralSummaries.build({
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

    describe(
      'table sort headings',
      {
        retries: {
          runMode: 2,
          openMode: 1,
        },
      },
      () => {
        const headings = ['Date sent', 'Referral', 'Person', 'Intervention type', 'Provider', 'Caseworker']
        headings.forEach(heading => {
          it(`when sorted by ${heading} sort direction should be set on header`, () => {
            cy.login()
            cy.get('h1').contains('Open cases')

            cy.get('table').within(() => cy.contains('button', heading).click())
            cy.get('h1').contains('Open cases')

            // check the clicked heading is sorted and all others are not
            cy.get('thead')
              .find('th')
              .each($el => {
                const sort = $el.text() === heading ? 'ascending' : 'none'
                cy.wrap($el).should('have.attr', { 'aria-sort': sort })
              })

            // clicking again sorts in the other direction
            cy.get('table').within(() => cy.contains('button', heading).click())
            cy.get('h1').contains('Open cases')
            cy.get('table').within(() =>
              cy.contains('button', heading).should('have.attr', { 'aria-sort': 'descending' })
            )
          })
        })
      }
    )
  })

  describe('As a service provider', () => {
    const accommodationIntervention = interventionFactory.build({
      title: 'Accommodation Services - West Midlands',
    })
    const womensServicesIntervention = interventionFactory.build({
      title: "Women's Services - West Midlands",
    })

    const sentReferrals = [
      sentReferralSummaries.assigned().build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'REFERRAL_REF',
        serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      }),
    ]
    const unassignedReferrals = [
      sentReferralSummaries.unassigned().build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'REFERRAL_REF',
        serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      }),
    ]
    const concludedReferrals = [
      sentReferralSummaries.concluded().build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'REFERRAL_REF',
        serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
        Caseworker: 'UserABC',
      }),
    ]

    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')

      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)

      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(sentReferrals).build())
    })

    describe('SP logs in and accesses "My cases"', () => {
      describe('Default "My Cases dashboard', () => {
        it('should see "My cases" with no Caseworker details', () => {
          cy.login()
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
      })

      describe('Selecting "All open cases"', () => {
        it('should see "All open cases" and Caseworker details', () => {
          cy.login()
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

        it('should filter open cases by PoP name - displaying no results', () => {
          cy.login()
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
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
          cy.get('#open-case-search-text').type('Hello, World')
          cy.get('#search-button-all-open-cases').click()
          cy.get('h2').contains('There are no results for "Hello, World"')

          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(sentReferrals).build())
          cy.get('#clear-search-button').click()
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

        it('should filter open cases by PoP name - displaying error, no values input', () => {
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('All open cases').click()
          cy.get('h1').contains('All open cases')
          cy.get('#search-button-all-open-cases').click()
          cy.get('h2').contains('You have not entered any search terms')
        })

        it('should filter open cases by PoP name - displaying correct results', () => {
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('All open cases').click()
          cy.get('h1').contains('All open cases')
          cy.get('#open-case-search-text').type('Jenny Jones')
          cy.get('#search-button-all-open-cases').click()
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
        it('should filter open cases by Referral Number - displaying correct results', () => {
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('All open cases').click()
          cy.get('h1').contains('All open cases')
          cy.get('#case-search-text').type('REFERRAL_REF')
          cy.get('#search-button-all-open-cases').click()
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
          cy.login()
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
        it('should filter unassigned cases by PoP name - displaying no results', () => {
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(unassignedReferrals).build())
          cy.login()
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
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
          cy.get('#case-search-text').type('Hello, World')
          cy.get('#case-search-button').click()
          cy.get('h2').contains('There are no results for "Hello, World"')

          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(unassignedReferrals).build())
          cy.get('#clear-search-button').click()
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
        it('should filter unassigned cases by PoP name - displaying error, no values input', () => {
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('Unassigned cases').click()
          cy.get('h1').contains('Unassigned cases')
          cy.get('#case-search-button').click()
          cy.get('h2').contains('You have not entered any search terms')
        })
        it('should filter unassigned cases by Referral Number - displaying correct results', () => {
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('Unassigned cases').click()
          cy.get('h1').contains('Unassigned cases')
          cy.get('#case-search-text').type('REFERRAL_REF')
          cy.get('#search-button-all-open-cases').click()
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
        it('should filter unassigned cases by PoP name - displaying correct results', () => {
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(unassignedReferrals).build())
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('Unassigned cases').click()
          cy.get('h1').contains('Unassigned cases')
          cy.get('#case-search-text').type('Jenny Jones')
          cy.get('#case-search-button').click()
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
        it('should filter unassigned cases by Referral Number - displaying correct results', () => {
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(unassignedReferrals).build())
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('Unassigned cases').click()
          cy.get('h1').contains('Unassigned cases')
          cy.get('#case-search-text').type('REFERRAL_REF')
          cy.get('#case-search-button').click()
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
        it('should see "Completed cases and Caseworker details"', () => {
          cy.login()
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
        it('should filter completed cases by PoP name - displaying no results', () => {
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(concludedReferrals).build())
          cy.login()
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
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
          cy.get('#case-search-text').type('Hello, World')
          cy.get('#search-button-all-open-cases').click()
          cy.get('h2').contains('There are no results for "Hello, World"')

          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(concludedReferrals).build())
          cy.get('#clear-search-button').click()
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
        it('should filter completed cases by PoP name - displaying error, no values input', () => {
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('Completed cases').click()
          cy.get('h1').contains('Completed cases')
          cy.get('#search-button-all-open-cases').click()
          cy.get('h2').contains('You have not entered any search terms')
        })
        it('should filter completed cases by Referral Number - displaying correct results', () => {
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('Completed cases').click()
          cy.get('h1').contains('Completed cases')
          cy.get('#case-search-text').type('REFERRAL_REF')
          cy.get('#search-button-all-open-cases').click()
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
        it('should filter completed cases by PoP name - displaying correct results', () => {
          cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(concludedReferrals).build())
          cy.login()
          cy.get('h1').contains('My cases')
          cy.contains('Completed cases').click()
          cy.get('h1').contains('Completed cases')
          cy.get('#case-search-text').type('Jenny Jones')
          cy.get('#search-button-all-open-cases').click()
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

      describe('table sort headings', () => {
        describe(
          'should show which column the table is currently sorted by',
          {
            retries: {
              runMode: 2,
              openMode: 1,
            },
          },
          () => {
            const headings = ['Date received', 'Referral', 'Person', 'Intervention type', 'Caseworker']
            headings.forEach(heading => {
              it(`should set headings correctly when sorting by ${heading}`, () => {
                cy.login()
                cy.get('h1').contains('My cases')

                cy.get('[data-cy=dashboard-navigation]').contains('All open cases').click()
                cy.get('h1').contains('All open cases')

                cy.get('table').within(() => cy.contains('button', heading).click())
                cy.get('h1').contains('All open cases')

                // check the clicked heading is sorted and all others are not
                cy.get('thead')
                  .find('th')
                  .each($el => {
                    const sort = $el.text() === heading ? 'ascending' : 'none'
                    cy.wrap($el).should('have.attr', { 'aria-sort': sort })
                  })

                // clicking again sorts in the other direction
                cy.get('table').within(() => cy.contains('button', heading).click())
                cy.get('h1').contains('All open cases')

                cy.get('table').within(() =>
                  cy.contains('button', heading).should('have.attr', { 'aria-sort': 'descending' })
                )
              })
            })
          }
        )

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

        describe('persists sort order', () => {
          dashBoardTables.forEach(table => {
            it(`persists the sort order when coming back to the page for dashboard "${table.dashboardType}"`, () => {
              cy.login()
              cy.get('h1').contains('My cases')

              cy.get('[data-cy=dashboard-navigation]').contains(table.dashboardType).click()
              cy.get('h1').contains(table.dashboardType)

              cy.get('table').within(() => cy.contains('button', table.sortField).click())
              cy.get('h1').contains(table.dashboardType)
              cy.get('table').within(() =>
                cy.contains('button', table.sortField).should('have.attr', { 'aria-sort': 'ascending' })
              )

              cy.get('[data-cy=dashboard-navigation]').contains(table.dashboardType).click()
              cy.get('h1').contains(table.dashboardType)

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
  })
})
