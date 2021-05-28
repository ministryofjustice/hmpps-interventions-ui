import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import endOfServiceReportFactory from '../../testutils/factories/endOfServiceReport'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import interventionFactory from '../../testutils/factories/intervention'

describe('Probation practitioner referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it("user logs in and sees 'My cases' screen with list of sent referrals", () => {
    const accommodationIntervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const womensServicesIntervention = interventionFactory.build({ contractType: { name: "womens' services" } })

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          interventionId: accommodationIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
      sentReferralFactory.build({
        sentAt: '2020-09-13T13:00:00.000000Z',
        assignedTo: {
          username: 'A. Caseworker',
          userId: '123',
          authSource: 'auth',
        },
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: womensServicesIntervention.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
    ]

    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
    cy.stubGetSentReferralsForUserToken(sentReferrals)

    cy.login()

    cy.get('h1').contains('My cases')

    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          Referral: 'ABCABCA1',
          'Service user': 'George Michael',
          'Service Category': 'Accommodation',
          Provider: 'Harmony Living',
          Caseworker: 'Unassigned',
          Action: 'View',
        },
        {
          Referral: 'ABCABCA2',
          'Service user': 'Jenny Jones',
          'Service Category': "Womens' services",
          Provider: 'Harmony Living',
          Caseworker: 'A. Caseworker',
          Action: 'View',
        },
      ])
  })

  it('user views an end of service report', () => {
    cy.stubGetSentReferralsForUserToken([])
    cy.login()

    const serviceCategory = serviceCategoryFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryId: serviceCategory.id,
        desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id],
        serviceUser: { crn: deliusServiceUser.otherIds.crn },
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.build({
      referralId: referral.id,
      outcomes: [
        {
          desiredOutcome: serviceCategory.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments',
          additionalTaskComments: 'Some task comments',
        },
      ],
      furtherInformation: 'Some further information',
    })

    cy.stubGetEndOfServiceReport(endOfServiceReport.id, endOfServiceReport)
    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetServiceUserByCRN(deliusServiceUser.otherIds.crn, deliusServiceUser)

    cy.visit(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)

    cy.contains('End of service report')
    cy.contains('The service provider has created an end of service report')
    cy.contains('Achieved')
    cy.contains(serviceCategory.desiredOutcomes[0].description)
    cy.contains('Some progression comments')
    cy.contains('Some task comments')
    cy.contains('Some further information')
  })
})
