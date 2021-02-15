import draftReferralFactory from '../../testutils/factories/draftReferral'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'

describe('Referral form', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it('User starts a referral, fills in the form, and submits it', () => {
    const deliusServiceUser = deliusServiceUserFactory.build({ firstName: 'Geoffrey' })

    const serviceCategory = serviceCategoryFactory.build({
      name: 'accommodation',
      desiredOutcomes: [
        {
          id: '1',
          description: 'Service User makes progress in obtaining accommodation',
        },
        {
          id: '2',
          description: 'Service User is prevented from becoming homeless',
        },
      ],
      complexityLevels: [
        {
          id: '1',
          title: 'Low complexity',
          description: 'Info about low complexity',
        },
        {
          id: '2',
          title: 'High complexity',
          description: 'Info about high complexity',
        },
      ],
    })

    const draftReferral = draftReferralFactory.build({
      serviceCategoryId: serviceCategory.id,
      serviceProvider: {
        name: 'Harmony Living',
      },
      serviceUser: {
        crn: 'X320741',
        title: 'Mr',
        firstName: 'Geoffrey',
        lastName: 'River',
        dateOfBirth: '1980-01-01',
        gender: 'Male',
        preferredLanguage: 'English',
        ethnicity: 'British',
        religionOrBelief: 'Agnostic',
        disabilities: ['Autism'],
      },
    })

    const completedDraftReferral = {
      ...draftReferral,
      completionDeadline: '2021-04-01',
      complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      furtherInformation: 'Some information about the service user',
      desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
      additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
      accessibilityNeeds: 'She uses a wheelchair',
      needsInterpreter: true,
      interpreterLanguage: 'Spanish',
      hasAdditionalResponsibilities: true,
      whenUnavailable: 'She works Mondays 9am - midday',
      additionalRiskInformation: 'A danger to the elderly',
      usingRarDays: true,
      maximumRarDays: 10,
    }

    const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build()

    cy.stubGetServiceUserByCRN('X320741', deliusServiceUser)
    cy.stubCreateDraftReferral(draftReferral)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetDraftReferralsForUser([])
    cy.stubGetDraftReferral(draftReferral.id, draftReferral)
    cy.stubPatchDraftReferral(draftReferral.id, draftReferral)
    cy.stubSendDraftReferral(draftReferral.id, sentReferral)
    cy.stubGetSentReferral(sentReferral.id, sentReferral)

    cy.login()

    const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

    cy.visit(`/intervention/${randomInterventionId}/refer`)

    cy.contains('Service User CRN').type('X320741')

    cy.contains('Start now').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

    cy.contains('Confirm service user details').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/service-user-details`)
    cy.get('h1').contains("Geoffrey's information")
    cy.contains('X320741')
    cy.contains('Mr')
    cy.contains('River')
    cy.contains('1980-01-01')
    cy.contains('Male')
    cy.contains('British')
    cy.contains('English')
    cy.contains('Agnostic')
    cy.contains('Autism')

    cy.contains('Save and continue').click()

    cy.contains('Service user’s needs and requirements').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/needs-and-requirements`)
    cy.get('h1').contains('Geoffrey’s needs and requirements')

    cy.contains('Additional information about Geoffrey’s needs').type(
      'Geoffrey is currently sleeping on his aunt’s sofa'
    )
    cy.contains('Does Geoffrey have any other mobility, disability or accessibility needs?').type(
      'He uses a wheelchair'
    )
    cy.withinFieldsetThatContains('Does Geoffrey need an interpreter?', () => {
      cy.contains('Yes').click()
    })
    cy.contains('What language?').type('Spanish')
    cy.withinFieldsetThatContains('Does Geoffrey have caring or employment responsibilities?', () => {
      cy.contains('Yes').click()
    })
    cy.contains('Provide details of when Geoffrey will not be able to attend sessions').type(
      'He works Mondays 9am - midday'
    )

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)
    cy.contains('Select desired outcomes').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/desired-outcomes`)
    cy.get('h1').contains('What are the desired outcomes for the accommodation service?')

    cy.contains('Service User makes progress in obtaining accommodation').click()
    cy.contains('Service User is prevented from becoming homeless').click()

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/complexity-level`)
    cy.get('h1').contains('What is the complexity level for the accommodation service?')
    cy.contains('Low complexity').click()

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/completion-deadline`)
    cy.get('h1').contains('What date does the accommodation service need to be completed by?')
    cy.contains('Day').type('15')
    cy.contains('Month').type('8')
    cy.contains('Year').type('2021')

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/rar-days`)
    cy.get('h1').contains('Are you using RAR days for the accommodation service?')
    cy.contains('Yes').click()
    cy.contains('What is the maximum number of RAR days for the accommodation service?').type('10')

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/further-information`)
    cy.get('h1').contains('Do you have further information for the accommodation service provider? (optional)')
    cy.get('textarea').type('Some information about Geoffrey')

    // stub completed draft referral to mark section as completed
    cy.stubGetDraftReferral(draftReferral.id, completedDraftReferral)

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

    cy.get('a').contains('Check your answers').click()
    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-answers`)

    cy.contains('Submit referral').click()
    cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

    cy.contains('We’ve sent your referral to Harmony Living')
    cy.contains(sentReferral.referenceNumber)
  })
})
