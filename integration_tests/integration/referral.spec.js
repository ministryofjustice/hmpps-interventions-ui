import draftReferralFactory from '../../testutils/factories/draftReferral'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import deliusConvictionFactory from '../../testutils/factories/deliusConviction'
import interventionFactory from '../../testutils/factories/intervention'
// eslint-disable-next-line import/no-named-as-default,import/no-named-as-default-member
import ReferralSectionVerifier from './make_a_referral/referralSectionVerifier'

describe('Referral form', () => {
  const deliusServiceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
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
  const accommodationServiceCategory = serviceCategoryFactory.build({
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
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  describe('for single referrals', () => {
    it('User starts a referral, fills in the form, and submits it', () => {
      const draftReferral = draftReferralFactory.serviceUserSelected().build({
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
      })

      const completedServiceUserDetailsDraftReferral = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory])
        .build({
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedDraftReferral = draftReferralFactory
        .filledFormUpToFurtherInformation([accommodationServiceCategory])
        .build({
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build()

      const intervention = interventionFactory.build()

      cy.stubGetServiceUserByCRN('X123456', deliusServiceUser)
      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetDraftReferralsForUserToken([])
      cy.stubGetDraftReferral(draftReferral.id, draftReferral)
      cy.stubPatchDraftReferral(draftReferral.id, draftReferral)
      cy.stubSendDraftReferral(draftReferral.id, sentReferral)
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetActiveConvictionsByCRN('X123456', convictions)
      cy.stubGetIntervention(draftReferral.interventionId, intervention)
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
      ReferralSectionVerifier.verifySection
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          riskInformation: true,
          needsAndRequirements: false,
        })
        .interventionReferralDetails({
          relevantSentence: false,
          requiredComplexityLevel: false,
          desiredOutcomes: false,
          completedDate: false,
          rarDays: false,
          furtherInformation: false,
        })
        .checkYourAnswers({ checkAnswers: false })

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
      ReferralSectionVerifier.verifySection
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          riskInformation: true,
          needsAndRequirements: true,
        })
        .interventionReferralDetails({
          relevantSentence: true,
          requiredComplexityLevel: false,
          desiredOutcomes: false,
          completedDate: false,
          rarDays: false,
          furtherInformation: false,
        })
        .checkYourAnswers({ checkAnswers: false })

      cy.contains('Confirm service user’s personal details').should('have.attr', 'href')

      cy.contains('Confirm the relevant sentence for the Accommodation referral').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.get('h1').contains('Select the relevant sentence for the Accommodation referral')

      cy.contains('Burglary').click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should(
        'equal',
        `/referrals/${draftReferral.id}/service-category/${draftReferral.serviceCategoryIds[0]}/desired-outcomes`
      )

      cy.get('h1').contains('What are the desired outcomes for the Accommodation service?')

      cy.contains('Service User makes progress in obtaining accommodation').click()
      cy.contains('Service User is prevented from becoming homeless').click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should(
        'equal',
        `/referrals/${draftReferral.id}/service-category/${draftReferral.serviceCategoryIds[0]}/complexity-level`
      )
      cy.get('h1').contains('What is the complexity level for the Accommodation service?')
      cy.contains('Low complexity').click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/completion-deadline`)
      cy.get('h1').contains('What date does the Accommodation referral need to be completed by?')
      cy.contains('Day').type('15')
      cy.contains('Month').type('8')
      cy.contains('Year').type('2021')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/rar-days`)
      cy.get('h1').contains('Are you using RAR days for the Accommodation referral?')
      cy.contains('Yes').click()
      cy.contains('What is the maximum number of RAR days for the Accommodation referral?').type('10')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/further-information`)
      cy.get('h1').contains(
        'Do you have further information for the Accommodation referral service provider? (optional)'
      )
      cy.get('textarea').type('Some information about Alex')

      // stub completed draft referral to mark section as completed
      cy.stubGetDraftReferral(draftReferral.id, completedDraftReferral)

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      cy.get('[data-cy=status]').eq(0).contains('COMPLETED', { matchCase: false })
      cy.get('[data-cy=status]').eq(1).contains('COMPLETED', { matchCase: false })
      cy.get('[data-cy=status]').eq(2).contains('NOT STARTED', { matchCase: false })
      ReferralSectionVerifier.verifySection
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          riskInformation: true,
          needsAndRequirements: true,
        })
        .interventionReferralDetails({
          relevantSentence: true,
          requiredComplexityLevel: true,
          desiredOutcomes: true,
          completedDate: true,
          rarDays: true,
          furtherInformation: true,
        })
        .checkYourAnswers({ checkAnswers: true })

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

      cy.contains('Accommodation referral details')
      cy.contains('Low complexity')
      cy.contains('Info about low complexity')
      cy.contains('Service User makes progress in obtaining accommodation')
      cy.contains('Service User is prevented from becoming homeless')

      cy.contains('Submit referral').click()
      cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

      cy.contains('We’ve sent your referral to Harmony Living')
      cy.contains(sentReferral.referenceNumber)
    })
  })
  describe('for cohort referrals, when user tries to make a referral', () => {
    it('should be able to complete a cohort referral', () => {
      const socialInclusionServiceCategory = serviceCategoryFactory.build({
        name: 'social inclusion',
        desiredOutcomes: [
          {
            id: '3',
            description: 'Service User develops and sustains social networks to reduce initial social isolation.',
          },
          {
            id: '4',
            description: 'Service User secures early post-release engagement with community based services.',
          },
          {
            id: '5',
            description:
              'Service User develops resilience and perseverance to cope with challenges and barriers on return to the community.',
          },
        ],
        complexityLevels: [
          {
            id: '3',
            title: 'Low complexity',
            description: 'Info about low complexity',
          },
          {
            id: '4',
            title: 'High complexity',
            description: 'Info about high complexity',
          },
        ],
      })
      const intervention = interventionFactory.build({
        title: "Women's Services",
        serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
        contractType: {
          code: 'WMS',
          name: "Women's Services",
        },
      })
      const draftReferral = draftReferralFactory.serviceUserSelected().build({
        serviceCategoryIds: null,
        interventionId: intervention.id,
        serviceProvider: {
          name: 'Harmony Living',
        },
      })

      const completedServiceUserDetailsDraftReferral = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          serviceCategoryIds: null,
          interventionId: intervention.id,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedSelectingServiceCategories = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory, socialInclusionServiceCategory])
        .selectedServiceCategories([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          interventionId: intervention.id,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedDraftReferral = draftReferralFactory
        .filledFormUpToFurtherInformation([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          interventionId: intervention.id,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build()

      cy.stubGetServiceUserByCRN('X123456', deliusServiceUser)
      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetDraftReferralsForUserToken([])
      cy.stubGetDraftReferral(draftReferral.id, draftReferral)
      cy.stubPatchDraftReferral(draftReferral.id, draftReferral)
      cy.stubSendDraftReferral(draftReferral.id, sentReferral)
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetActiveConvictionsByCRN('X123456', convictions)
      cy.stubGetIntervention(draftReferral.interventionId, intervention)
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
      cy.get('[data-cy=status]').eq(3).contains('CANNOT START YET', { matchCase: false })
      ReferralSectionVerifier.verifySection
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          riskInformation: true,
          needsAndRequirements: false,
        })
        .selectServiceCategories({ selectServiceCategories: false })
        .checkYourAnswers({ checkAnswers: false })

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
      cy.get('[data-cy=status]').eq(3).contains('CANNOT START YET', { matchCase: false })
      ReferralSectionVerifier.verifySection
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          riskInformation: true,
          needsAndRequirements: true,
        })
        .selectServiceCategories({ selectServiceCategories: true })
        .checkYourAnswers({ checkAnswers: false })
      cy.contains('Select service categories').click()
      cy.get('h1').contains('What service categories are you referring Alex to?')
      cy.contains('Accommodation').click()
      cy.contains('Social inclusion').click()

      cy.stubGetDraftReferral(draftReferral.id, completedSelectingServiceCategories)
      cy.contains('Save and continue').click()
      cy.get('[data-cy=status]').eq(0).contains('COMPLETED', { matchCase: false })
      cy.get('[data-cy=status]').eq(1).contains('COMPLETED', { matchCase: false })
      cy.get('[data-cy=status]').eq(2).contains('NOT STARTED', { matchCase: false })
      cy.get('[data-cy=status]').eq(3).contains('CANNOT START YET', { matchCase: false })
      ReferralSectionVerifier.verifySection
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          riskInformation: true,
          needsAndRequirements: true,
        })
        .selectServiceCategories({ selectServiceCategories: true })
        .cohortInterventionReferralDetails({
          relevantSentence: true,
          requiredComplexityLevel1: false,
          desiredOutcomes1: false,
          requiredComplexityLevel2: false,
          desiredOutcomes2: false,
          completedDate: false,
          rarDays: false,
          furtherInformation: false,
        })
        .checkYourAnswers({ checkAnswers: false })

      cy.contains("Confirm the relevant sentence for the Women's services referral").click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.get('h1').contains("Select the relevant sentence for the Women's services referral")

      cy.contains('Burglary').click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should(
        'equal',
        `/referrals/${draftReferral.id}/service-category/${completedSelectingServiceCategories.serviceCategoryIds[0]}/desired-outcomes`
      )
      cy.get('h1').contains('What are the desired outcomes for the Accommodation service?')

      cy.contains('Service User makes progress in obtaining accommodation').click()
      cy.contains('Service User is prevented from becoming homeless').click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should(
        'equal',
        `/referrals/${draftReferral.id}/service-category/${completedSelectingServiceCategories.serviceCategoryIds[0]}/complexity-level`
      )

      cy.get('h1').contains('What is the complexity level for the Accommodation service?')
      cy.contains('Low complexity').click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should(
        'equal',
        `/referrals/${draftReferral.id}/service-category/${completedSelectingServiceCategories.serviceCategoryIds[1]}/desired-outcomes`
      )
      cy.get('h1').contains('What are the desired outcomes for the Social inclusion service?')
      cy.contains('Service User develops and sustains social networks to reduce initial social isolation.').click()
      cy.contains('Service User secures early post-release engagement with community based services.').click()
      cy.contains(
        'Service User develops resilience and perseverance to cope with challenges and barriers on return to the community.'
      ).click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should(
        'equal',
        `/referrals/${draftReferral.id}/service-category/${completedSelectingServiceCategories.serviceCategoryIds[1]}/complexity-level`
      )

      cy.get('h1').contains('What is the complexity level for the Social inclusion service?')
      cy.contains('Low complexity').click()

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/completion-deadline`)
      cy.get('h1').contains("What date does the Women's services referral need to be completed by?")
      cy.contains('Day').type('15')
      cy.contains('Month').type('8')
      cy.contains('Year').type('2021')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/rar-days`)
      cy.get('h1').contains("Are you using RAR days for the Women's services referral?")
      cy.contains('Yes').click()
      cy.contains("What is the maximum number of RAR days for the Women's services referral?").type('10')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/further-information`)
      cy.get('h1').contains(
        "Do you have further information for the Women's services referral service provider? (optional)"
      )
      cy.get('textarea').type('Some information about Alex')

      // stub completed draft referral to mark section as completed
      cy.stubGetDraftReferral(draftReferral.id, completedDraftReferral)

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      cy.get('[data-cy=status]').eq(0).contains('COMPLETED', { matchCase: false })
      cy.get('[data-cy=status]').eq(1).contains('COMPLETED', { matchCase: false })
      cy.get('[data-cy=status]').eq(2).contains('COMPLETED', { matchCase: false })
      cy.get('[data-cy=status]').eq(3).contains('NOT STARTED', { matchCase: false })
      ReferralSectionVerifier.verifySection
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          riskInformation: true,
          needsAndRequirements: true,
        })
        .selectServiceCategories({ selectServiceCategories: true })
        .cohortInterventionReferralDetails({
          relevantSentence: true,
          requiredComplexityLevel1: true,
          desiredOutcomes1: true,
          requiredComplexityLevel2: true,
          desiredOutcomes2: true,
          completedDate: true,
          rarDays: true,
          furtherInformation: true,
        })
        .checkYourAnswers({ checkAnswers: true })

      cy.get('a').contains('Check your answers').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-answers`)

      cy.contains('Submit referral').click()
      cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

      cy.contains('We’ve sent your referral to Harmony Living')
      cy.contains(sentReferral.referenceNumber)
    })
  })
})
