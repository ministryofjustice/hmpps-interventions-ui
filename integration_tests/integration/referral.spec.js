import draftReferralFactory from '../../testutils/factories/draftReferral'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import deliusConvictionFactory from '../../testutils/factories/deliusConviction'

describe('Referral form', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it('User starts a referral, fills in the form, and submits it', () => {
    const deliusServiceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

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

    const draftReferral = draftReferralFactory.serviceUserSelected().build({
      serviceCategoryId: serviceCategory.id,
      serviceCategoryIds: [serviceCategory.id],
      serviceProvider: {
        name: 'Harmony Living',
      },
    })

    const completedServiceUserDetailsDraftReferral = draftReferralFactory.serviceUserDetailsSet().build({
      serviceCategoryId: serviceCategory.id,
      serviceCategoryIds: [serviceCategory.id],
      serviceProvider: {
        name: 'Harmony Living',
      },
    })

    const completedDraftReferral = {
      ...completedServiceUserDetailsDraftReferral,
      completionDeadline: '2021-04-01',
      complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      furtherInformation: 'Some information about the service user',
      relevantSentenceId: 12345678910,
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

    const convictionWithSentenceToSelect = deliusConvictionFactory.build({
      convictionId: 123456789,
      active: true,
      offences: [
        {
          mainOffence: true,
          detail: {
            mainCategoryDescription: 'Burglary',
            subCategoryDescription: 'Theft act, 1968',
          },
        },
        {
          mainOffence: false,
          detail: {
            mainCategoryDescription: 'Common and other types of assault',
            subCategoryDescription: 'Common assault and battery',
          },
        },
      ],
      sentence: {
        sentenceId: 2500284169,
        description: 'Absolute/Conditional Discharge',
        expectedSentenceEndDate: '2025-11-15',
        sentenceType: {
          code: 'SC',
          description: 'CJA - Indeterminate Public Prot.',
        },
      },
    })

    const convictions = [convictionWithSentenceToSelect, deliusConvictionFactory.build()]

    const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build()

    cy.stubGetServiceUserByCRN('X123456', deliusServiceUser)
    cy.stubCreateDraftReferral(draftReferral)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetSentReferrals([])
    cy.stubGetDraftReferralsForUser([])
    cy.stubGetDraftReferral(draftReferral.id, draftReferral)
    cy.stubPatchDraftReferral(draftReferral.id, draftReferral)
    cy.stubSendDraftReferral(draftReferral.id, sentReferral)
    cy.stubGetSentReferral(sentReferral.id, sentReferral)
    cy.stubGetActiveConvictionsByCRN('X123456', convictions)
    cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
    cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)

    cy.login()

    const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

    cy.visit(`/intervention/${randomInterventionId}/refer`)

    cy.contains('Service user CRN').type('X123456')

    cy.contains('Continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

    cy.get('[data-cy=status]').eq(0).contains('NOT STARTED', { matchCase: false })
    cy.get('[data-cy=status]').eq(1).contains('CANNOT START YET', { matchCase: false })
    cy.get('[data-cy=status]').eq(2).contains('CANNOT START YET', { matchCase: false })

    cy.contains('Confirm service user’s personal details').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/service-user-details`)
    cy.get('h1').contains("Alex's information")
    cy.contains('X123456')
    cy.contains('Mr')
    cy.contains('River')
    cy.contains('1 January 1980')
    cy.contains('Male')
    cy.contains('British')
    cy.contains('English')
    cy.contains('Agnostic')
    cy.contains('Autism')

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/risk-information`)
    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/needs-and-requirements`)
    cy.get('h1').contains('Alex’s needs and requirements')

    cy.contains('Additional information about Alex’s needs').type('Alex is currently sleeping on his aunt’s sofa')
    cy.contains('Does Alex have any other mobility, disability or accessibility needs?').type('He uses a wheelchair')
    cy.withinFieldsetThatContains('Does Alex need an interpreter?', () => {
      cy.contains('Yes').click()
    })
    cy.contains('What language?').type('Spanish')
    cy.withinFieldsetThatContains('Does Alex have caring or employment responsibilities?', () => {
      cy.contains('Yes').click()
    })
    cy.contains('Provide details of when Alex will not be able to attend sessions').type(
      'He works Mondays 9am - midday'
    )
    cy.stubGetDraftReferral(draftReferral.id, completedServiceUserDetailsDraftReferral)
    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

    cy.get('[data-cy=status]').eq(0).contains('COMPLETED', { matchCase: false })
    cy.get('[data-cy=status]').eq(1).contains('NOT STARTED', { matchCase: false })
    cy.get('[data-cy=status]').eq(2).contains('CANNOT START YET', { matchCase: false })

    cy.contains('Select the relevant sentence for the accommodation referral').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/relevant-sentence`)
    cy.get('h1').contains('Select the relevant sentence for the accommodation referral')

    cy.contains('Burglary').click()

    cy.contains('Save and continue').click()

    cy.location('pathname').should(
      'equal',
      `/referrals/${draftReferral.id}/service-category/${draftReferral.serviceCategoryIds[0]}/desired-outcomes`
    )
    cy.get('h1').contains('What are the desired outcomes for the accommodation service?')

    cy.contains('Service User makes progress in obtaining accommodation').click()
    cy.contains('Service User is prevented from becoming homeless').click()

    cy.contains('Save and continue').click()

    cy.location('pathname').should(
      'equal',
      `/referrals/${draftReferral.id}/service-category/${draftReferral.serviceCategoryIds[0]}/complexity-level`
    )
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
    cy.get('textarea').type('Some information about Alex')

    // stub completed draft referral to mark section as completed
    cy.stubGetDraftReferral(draftReferral.id, completedDraftReferral)

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

    cy.get('[data-cy=status]').eq(0).contains('COMPLETED', { matchCase: false })
    cy.get('[data-cy=status]').eq(1).contains('COMPLETED', { matchCase: false })
    cy.get('[data-cy=status]').eq(2).contains('NOT STARTED', { matchCase: false })

    cy.get('a').contains('Check your answers').click()
    cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-answers`)

    cy.contains('X123456')
    cy.contains('Mr')
    cy.contains('River')
    cy.contains('1 January 1980')
    cy.contains('Male')
    cy.contains('British')
    cy.contains('English')
    cy.contains('Agnostic')
    cy.contains('Autism')

    cy.contains('Alex is currently sleeping on her aunt’s sofa')
    cy.contains('She uses a wheelchair')
    cy.contains('Yes. Spanish')
    cy.contains('Yes. She works Mondays 9am - midday')

    cy.contains('Submit referral').click()
    cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

    cy.contains('We’ve sent your referral to Harmony Living')
    cy.contains(sentReferral.referenceNumber)
  })
})
