import sentReferralFactory from '../../testutils/factories/sentReferral'
import interventionFactory from '../../testutils/factories/intervention'
import serviceProviderSentReferralSummaryFactory from '../../testutils/factories/serviceProviderSentReferralSummary'

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
      cy.stubGetSentReferralsForUserToken(sentReferrals)
    })

    describe('Viewing the dashboard page', () => {
      it('shows a list of sent referrals', () => {
        cy.login()

        cy.get('h1').contains('My cases')

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

    describe('Sorting the table', () => {
      const referralToSelect = sentReferrals[0]

      const initialTable = [
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
      ]

      const headersAndTables = [
        {
          header: 'Date sent',
          sortedTable: [
            {
              'Date sent': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Provider: 'Forward Solutions',
              Caseworker: 'A. Caseworker',
              Action: 'View',
            },
            {
              'Date sent': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Provider: 'Harmony Living',
              Caseworker: 'Unassigned',
              Action: 'View',
            },
          ],
        },
        {
          header: 'Referral',
          sortedTable: [
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
          ],
        },
        {
          header: 'Service user',
          sortedTable: [
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
          ],
        },
        {
          header: 'Intervention type',
          sortedTable: [
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
          ],
        },
        {
          header: 'Provider',
          sortedTable: [
            {
              'Date sent': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Provider: 'Forward Solutions',
              Caseworker: 'A. Caseworker',
              Action: 'View',
            },
            {
              'Date sent': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Provider: 'Harmony Living',
              Caseworker: 'Unassigned',
              Action: 'View',
            },
          ],
        },
        {
          header: 'Caseworker',
          sortedTable: [
            {
              'Date sent': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Provider: 'Forward Solutions',
              Caseworker: 'A. Caseworker',
              Action: 'View',
            },
            {
              'Date sent': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Provider: 'Harmony Living',
              Caseworker: 'Unassigned',
              Action: 'View',
            },
          ],
        },
      ]

      headersAndTables.forEach(({ header, sortedTable }) => {
        describe(`sorting by "${header}"`, () => {
          it(`allows the user to sort by "${header}"`, () => {
            cy.login()
            cy.get('table').getTable().should('deep.equal', initialTable)

            cy.get('table').within(() => cy.contains('button', header).click())
            cy.get('table').getTable().should('deep.equal', sortedTable)

            cy.get('table').within(() => cy.contains('button', header).click())

            const reversedTable = [...sortedTable].reverse()
            cy.get('table').getTable().should('deep.equal', reversedTable)
          })

          it('persists the sort order when coming back to the page', () => {
            cy.login()

            cy.get('table').within(() => cy.contains('button', header).click())
            cy.get('table').getTable().should('deep.equal', sortedTable)

            cy.stubViewReferralDetails(referralToSelect)

            cy.visit(`/probation-practitioner/referrals/${referralToSelect.id}/details`)
            cy.contains('Back').click()

            // Wait for header sort button to load, as it means JS has run
            cy.get('table').within(() => cy.contains('button', header))
            cy.get('table').getTable().should('deep.equal', sortedTable)
          })
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

    const sentReferralSummaries = [
      serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        interventionTitle: accommodationIntervention.title,
        serviceUserFirstName: 'George',
        serviceUserLastName: 'Michael',
      }),
      serviceProviderSentReferralSummaryFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        interventionTitle: womensServicesIntervention.title,
        serviceUserFirstName: 'Jenny',
        serviceUserLastName: 'Jones',
        assignedToUserName: 'A.Caseworker',
      }),
    ]

    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')

      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken(sentReferralSummaries)
    })

    it("SP logs in and sees 'My cases' screen with list of sent referrals", () => {
      cy.login()

      cy.get('h1').contains('All cases')

      cy.get('table')
        .getTable()
        .should('deep.equal', [
          {
            'Date received': '26 Jan 2021',
            Referral: 'ABCABCA1',
            'Service user': 'George Michael',
            'Intervention type': 'Accommodation Services - West Midlands',
            Caseworker: '',
            Action: 'View',
          },
          {
            'Date received': '13 Dec 2020',
            Referral: 'ABCABCA2',
            'Service user': 'Jenny Jones',
            'Intervention type': "Women's Services - West Midlands",
            Caseworker: 'A.Caseworker',
            Action: 'View',
          },
        ])
    })

    describe('Sorting the table', () => {
      const initialTable = [
        {
          'Date received': '26 Jan 2021',
          Referral: 'ABCABCA1',
          'Service user': 'George Michael',
          'Intervention type': 'Accommodation Services - West Midlands',
          Caseworker: '',
          Action: 'View',
        },
        {
          'Date received': '13 Dec 2020',
          Referral: 'ABCABCA2',
          'Service user': 'Jenny Jones',
          'Intervention type': "Women's Services - West Midlands",
          Caseworker: 'A.Caseworker',
          Action: 'View',
        },
      ]

      const headersAndTables = [
        {
          header: 'Date received',
          sortedTable: [
            {
              'Date received': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Caseworker: 'A.Caseworker',
              Action: 'View',
            },
            {
              'Date received': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Caseworker: '',
              Action: 'View',
            },
          ],
        },
        {
          header: 'Referral',
          sortedTable: [
            {
              'Date received': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Caseworker: '',
              Action: 'View',
            },
            {
              'Date received': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Caseworker: 'A.Caseworker',
              Action: 'View',
            },
          ],
        },
        {
          header: 'Service user',
          sortedTable: [
            {
              'Date received': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Caseworker: 'A.Caseworker',
              Action: 'View',
            },
            {
              'Date received': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Caseworker: '',
              Action: 'View',
            },
          ],
        },
        {
          header: 'Intervention type',
          sortedTable: [
            {
              'Date received': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Caseworker: '',
              Action: 'View',
            },
            {
              'Date received': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Caseworker: 'A.Caseworker',
              Action: 'View',
            },
          ],
        },
        {
          header: 'Caseworker',
          sortedTable: [
            {
              'Date received': '26 Jan 2021',
              Referral: 'ABCABCA1',
              'Service user': 'George Michael',
              'Intervention type': 'Accommodation Services - West Midlands',
              Caseworker: '',
              Action: 'View',
            },
            {
              'Date received': '13 Dec 2020',
              Referral: 'ABCABCA2',
              'Service user': 'Jenny Jones',
              'Intervention type': "Women's Services - West Midlands",
              Caseworker: 'A.Caseworker',
              Action: 'View',
            },
          ],
        },
      ]

      const referralToSelect = sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          interventionId: accommodationIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
        },
      })

      headersAndTables.forEach(({ header, sortedTable }) => {
        describe(`sorting by "${header}"`, () => {
          it(`allows the user to sort by "${header}"`, () => {
            cy.login()

            cy.get('table').getTable().should('deep.equal', initialTable)

            cy.get('table').within(() => cy.contains('button', header).click())
            cy.get('table').getTable().should('deep.equal', sortedTable)

            cy.get('table').within(() => cy.contains('button', header).click())

            const reversedTable = [...sortedTable].reverse()
            cy.get('table').getTable().should('deep.equal', reversedTable)
          })

          it('persists the sort order when coming back to the page', () => {
            cy.login()

            cy.get('table').within(() => cy.contains('button', header).click())
            cy.get('table').getTable().should('deep.equal', sortedTable)

            cy.stubViewReferralDetails(referralToSelect)

            cy.visit(`/service-provider/referrals/${referralToSelect.id}/details`)
            cy.contains('Back').click()

            // Wait for header sort button to load, as it means JS has run
            cy.get('table').within(() => cy.contains('button', header))
            cy.get('table').getTable().should('deep.equal', sortedTable)
          })
        })
      })
    })
  })
})
