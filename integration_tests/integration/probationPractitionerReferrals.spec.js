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
    const serviceCategory = serviceCategoryFactory.build()
    const accommodationIntervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const womensServicesIntervention = interventionFactory.build({ contractType: { name: "womens' services" } })

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          interventionId: accommodationIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
          serviceCategoryIds: [serviceCategory.id],
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
            },
          ],
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78' },
          ],
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
          serviceCategoryIds: [serviceCategory.id],
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
            },
          ],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78' },
          ],
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
    const serviceCategory1 = serviceCategoryFactory.build()
    const serviceCategory2 = serviceCategoryFactory.build({
      desiredOutcomes: [
        {
          id: '2d63bedc-9658-40c4-9d31-da649396ace1',
          description: 'Some other desired outcome',
        },
      ],
    })
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory1, serviceCategory2] })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const referral = sentReferralFactory.build({
      referral: {
        interventionId: intervention.id,
        serviceCategoryIds: [serviceCategory1.id, serviceCategory2.id],
        desiredOutcomes: [
          { serviceCategoryId: serviceCategory1.id, desiredOutcomesIds: [serviceCategory1.desiredOutcomes[0].id] },
          { serviceCategoryId: serviceCategory2.id, desiredOutcomesIds: [serviceCategory2.desiredOutcomes[0].id] },
        ],
        serviceUser: { crn: deliusServiceUser.otherIds.crn },
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.build({
      referralId: referral.id,
      outcomes: [
        {
          desiredOutcome: serviceCategory1.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments for serviceCategory1',
          additionalTaskComments: 'Some task comments for serviceCategory1',
        },
        {
          desiredOutcome: serviceCategory2.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments for serviceCategory2',
          additionalTaskComments: 'Some task comments for serviceCategory2',
        },
      ],
      furtherInformation: 'Some further information',
    })

    cy.stubGetEndOfServiceReport(endOfServiceReport.id, endOfServiceReport)
    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetIntervention(intervention.id, intervention)
    cy.stubGetServiceCategory(serviceCategory1.id, serviceCategory1)
    cy.stubGetServiceCategory(serviceCategory2.id, serviceCategory2)
    cy.stubGetServiceUserByCRN(deliusServiceUser.otherIds.crn, deliusServiceUser)

    cy.visit(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)

    cy.contains('End of service report')
    cy.contains('The service provider has created an end of service report')
    cy.contains('Achieved')
    cy.contains(serviceCategory1.desiredOutcomes[0].description)
    cy.contains('Some progression comments for serviceCategory1')
    cy.contains('Some task comments for serviceCategory1')
    cy.contains(serviceCategory2.desiredOutcomes[0].description)
    cy.contains('Some progression comments for serviceCategory1')
    cy.contains('Some task comments for serviceCategory1')
    cy.contains('Some further information')
  })
})
