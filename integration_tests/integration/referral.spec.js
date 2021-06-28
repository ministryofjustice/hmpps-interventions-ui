import draftReferralFactory from '../../testutils/factories/draftReferral'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import deliusConvictionFactory from '../../testutils/factories/deliusConviction'
import interventionFactory from '../../testutils/factories/intervention'
// eslint-disable-next-line import/no-named-as-default,import/no-named-as-default-member
import ReferralSectionVerifier from './make_a_referral/referralSectionVerifier'
import riskSummaryFactory from '../../testutils/factories/riskSummary'
import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'

describe('Referral form', () => {
  const deliusServiceUser = deliusServiceUserFactory.build({
    firstName: 'Alex',
    contactDetails: {
      emailAddresses: ['alex.river@example.com', 'a.r@example.com'],
      phoneNumbers: [
        {
          number: '0123456789',
          type: 'MOBILE',
        },
        {
          number: '9876543210',
          type: 'MOBILE',
        },
      ],
    },
  })
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
        description: 'Service user makes progress in obtaining accommodation',
      },
      {
        id: '2',
        description: 'Service user is prevented from becoming homeless',
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
        id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
      })

      const completedServiceUserDetailsDraftReferral = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory])
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedDraftReferral = draftReferralFactory
        .filledFormUpToFurtherInformation([accommodationServiceCategory])
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
          furtherInformation: 'Some information about Alex',
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build({
        id: draftReferral.id,
      })

      const intervention = interventionFactory.build({ serviceCategories: [accommodationServiceCategory] })

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
      cy.stubGetConvictionById('X123456', 123456789, convictions[0])
      cy.stubGetIntervention(draftReferral.interventionId, intervention)
      cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
      cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)
      cy.stubGetRiskSummary(draftReferral.serviceUser.crn, riskSummaryFactory.build())

      cy.login()

      const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

      cy.visit(`/intervention/${randomInterventionId}/refer`)

      cy.contains('Service user CRN').type(' x123456 ')

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
          enforceableDays: false,
          furtherInformation: false,
        })
        .checkYourAnswers({ checkAnswers: false })

      const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({
        ...deliusServiceUser,
        contactDetails: {
          addresses: [
            {
              addressNumber: 'Flat 2',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2019-01-01',
              to: null,
              noFixedAbode: false,
            },
          ],
        },
      })

      cy.stubGetExpandedServiceUserByCRN('X123456', expandedDeliusServiceUser)

      cy.contains('Confirm service user’s personal details').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/service-user-details`)
      cy.get('h1').contains("Alex's information")
      cy.contains('X123456')
      cy.contains('Mr')
      cy.contains('River')
      cy.contains('1 January 1980')
      cy.contains('Flat 2 Test Walk')
      cy.contains('London')
      cy.contains('City of London')
      cy.contains('Greater London')
      cy.contains('SW16 1AQ')
      cy.contains('Male')
      cy.contains('British')
      cy.contains('English')
      cy.contains('Agnostic')
      cy.contains('Autism')
      cy.contains("Alex's information").next().contains('Email address').next().contains('alex.river@example.com')
      cy.contains("Alex's information").next().contains('Phone number').next().contains('0123456789')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/risk-information`)
      cy.contains('Add information for the service provider').type('A danger to the elderly')
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
          enforceableDays: false,
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

      cy.contains('Service user makes progress in obtaining accommodation').click()
      cy.contains('Service user is prevented from becoming homeless').click()

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

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/enforceable-days`)
      cy.get('h1').contains('How many enforceable days will you use for this service?')
      cy.contains('How many enforceable days will you use for this service?').type('10')

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
          enforceableDays: true,
          furtherInformation: true,
        })
        .checkYourAnswers({ checkAnswers: true })

      cy.get('a').contains('Check your answers').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-answers`)

      cy.contains('X123456')
      cy.contains('Mr')
      cy.contains('River')
      cy.contains('1 January 1980')
      cy.contains('Flat 2 Test Walk')
      cy.contains('London')
      cy.contains('City of London')
      cy.contains('Greater London')
      cy.contains('SW16 1AQ')
      cy.contains('Male')
      cy.contains('British')
      cy.contains('English')
      cy.contains('Agnostic')
      cy.contains('Autism')
      cy.contains('alex.river@example.com')

      cy.contains('A danger to the elderly')

      // Alex's needs and requirements
      cy.contains('Additional information about Alex’s needs (optional)')
        .next()
        .contains('Alex is currently sleeping on her aunt’s sofa')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Does Alex have any other mobility, disability or accessibility needs? (optional)')
        .next()
        .contains('She uses a wheelchair')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Does Alex need an interpreter?')
        .next()
        .contains('Yes. Spanish')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Does Alex have caring or employment responsibilities?')
        .next()
        .contains('Yes. She works Mondays 9am - midday')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)

      // Sentence information
      cy.contains('Sentence')
        .next()
        .contains('Burglary')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.contains('Subcategory')
        .next()
        .contains('Theft act, 1968')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.contains('End of sentence date')
        .next()
        .contains('15 November 2025')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/relevant-sentence`)

      cy.contains('Accommodation referral details')
      cy.contains('Low complexity')
      cy.contains('Info about low complexity')
      cy.contains('Service user makes progress in obtaining accommodation')
      cy.contains('Service user is prevented from becoming homeless')

      cy.contains('24 August 2021')

      cy.contains('Yes')
      cy.contains('10')

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
            description: 'Service user develops and sustains social networks to reduce initial social isolation.',
          },
          {
            id: '4',
            description: 'Service user secures early post-release engagement with community based services.',
          },
          {
            id: '5',
            description:
              'Service user develops resilience and perseverance to cope with challenges and barriers on return to the community.',
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
      cy.stubGetConvictionById('X123456', 123456789, convictions[0])
      cy.stubGetIntervention(draftReferral.interventionId, intervention)
      cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
      cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)
      cy.stubGetRiskSummary(draftReferral.serviceUser.crn, riskSummaryFactory.build())

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
        .disabledCohortInterventionReferralDetails()
        .checkYourAnswers({ checkAnswers: false })

      const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({
        ...deliusServiceUser,
        contactDetails: {
          addresses: [
            {
              addressNumber: 'Flat 2',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2019-01-01',
              to: null,
              noFixedAbode: false,
            },
          ],
        },
      })

      cy.stubGetExpandedServiceUserByCRN('X123456', expandedDeliusServiceUser)

      cy.contains('Confirm service user’s personal details').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/service-user-details`)
      cy.get('h1').contains("Alex's information")
      cy.contains('X123456')
      cy.contains('Mr')
      cy.contains('River')
      cy.contains('1 January 1980')
      cy.contains('Flat 2 Test Walk')
      cy.contains('London')
      cy.contains('City of London')
      cy.contains('Greater London')
      cy.contains('SW16 1AQ')
      cy.contains('Male')
      cy.contains('British')
      cy.contains('English')
      cy.contains('Agnostic')
      cy.contains('Autism')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/risk-information`)
      cy.contains('Add information for the service provider').type('A danger to the elderly')
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
          enforceableDays: false,
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

      cy.contains('Service user makes progress in obtaining accommodation').click()
      cy.contains('Service user is prevented from becoming homeless').click()

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
      cy.contains('Service user develops and sustains social networks to reduce initial social isolation.').click()
      cy.contains('Service user secures early post-release engagement with community based services.').click()
      cy.contains(
        'Service user develops resilience and perseverance to cope with challenges and barriers on return to the community.'
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

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/enforceable-days`)
      cy.get('h1').contains('How many enforceable days will you use for this service?')
      cy.contains('How many enforceable days will you use for this service?').type('10')

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
          enforceableDays: true,
          furtherInformation: true,
        })
        .checkYourAnswers({ checkAnswers: true })

      cy.get('a').contains('Check your answers').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-answers`)

      cy.contains('Accommodation')
      cy.contains('Social inclusion')

      cy.contains('Submit referral').click()
      cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

      cy.contains('We’ve sent your referral to Harmony Living')
      cy.contains(sentReferral.referenceNumber)
    })
  })
})
