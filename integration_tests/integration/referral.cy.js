import moment from 'moment-timezone'
import draftReferralFactory from '../../testutils/factories/draftReferral'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import deliusConvictionFactory from '../../testutils/factories/deliusConviction'
import interventionFactory from '../../testutils/factories/intervention'
import prisonFactory from '../../testutils/factories/prison'
import deliusResponsibleOfficerFactory from '../../testutils/factories/deliusResponsibleOfficer'
// eslint-disable-next-line import/no-named-as-default,import/no-named-as-default-member
import ReferralSectionVerifier from './make_a_referral/referralSectionVerifier'
import riskSummaryFactory from '../../testutils/factories/riskSummary'
import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import draftOasysRiskInformation from '../../testutils/factories/draftOasysRiskInformation'
import pageFactory from '../../testutils/factories/page'
import { CurrentLocationType } from '../../server/models/draftReferral'

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
    id: '428ee70f-3001-4399-95a6-ad25eaaede16',
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
      cy.viewport(1536, 960)
      const draftReferral = draftReferralFactory.serviceUserSelected().build({
        id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
      })

      const completedCurrentLocationDraftReferral = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory])
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedServiceUserDetailsDraftReferral = draftReferralFactory
        .filledFormUpToExpectedReleaseDate([accommodationServiceCategory], false, CurrentLocationType.custody)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedExpectedReleaseDatesDraftReferral = draftReferralFactory
        .filledFormUpToCurrentLocation([accommodationServiceCategory], false, CurrentLocationType.community)
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

      const prisons = prisonFactory.prisonList()

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build({
        id: draftReferral.id,
      })

      const intervention = interventionFactory.build({ serviceCategories: [accommodationServiceCategory] })

      cy.stubGetServiceUserByCRN('X123456', deliusServiceUser)
      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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

      cy.contains('The person’s CRN').type(' x123456 ')

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
          enforceableDays: false,
          completedDate: false,
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

      cy.contains('Confirm their personal details').click()

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
      cy.contains('Additional information')
      cy.withinFieldsetThatContains('Do you want to edit this OASys risk information for the Service Provider?', () => {
        cy.contains('Yes').click()
      })
      cy.contains('Save and continue').click()
      cy.stubPatchDraftOasysRiskInformation(draftReferral.id, draftOasysRiskInformation.build())
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/edit-oasys-risk-information`)
      cy.get('#confirm-understood').click()

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

      cy.stubGetPrisons(prisons)
      cy.stubGetDraftReferral(draftReferral.id, completedCurrentLocationDraftReferral)
      cy.stubGetExpandedServiceUserByCRN('X123456', expandedDeliusServiceUser)

      cy.contains('Save and continue').click()

      // Submit current location Page
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/submit-current-location`)
      cy.get('h1').contains('Submit Alex River’s current location')

      cy.withinFieldsetThatContains('Where is Alex today?', () => {
        cy.contains('Custody (select even if Alex is due to be released today)').click()
      })
      cy.get('#prison-select').type('Aylesbury (HMYOI)')
      cy.stubGetDraftReferral(draftReferral.id, completedExpectedReleaseDatesDraftReferral)
      cy.contains('Save and continue').click()

      // Submit expected release date
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/expected-release-date`)
      cy.get('h1').contains('Do you know the expected release date')
      cy.contains('Yes').click()
      const tomorrow = moment().add(1, 'days')
      cy.contains('Day').type(tomorrow.format('DD'))
      cy.contains('Month').type(tomorrow.format('MM'))
      cy.contains('Year').type(tomorrow.format('YYYY'))

      cy.stubGetDraftReferral(draftReferral.id, completedServiceUserDetailsDraftReferral)
      cy.contains('Save and continue').click()

      // Service Category details Section
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
          enforceableDays: false,
          completedDate: false,
          furtherInformation: false,
        })
        .checkYourAnswers({ checkAnswers: false })

      cy.contains('Confirm their personal details').should('have.attr', 'href')

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

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/enforceable-days`)
      cy.get('h1').contains('How many days will you use for this service?')
      cy.contains('How many days will you use for this service?').type('10')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/completion-deadline`)
      cy.get('h1').contains('What date does the Accommodation intervention need to be completed by?')
      cy.contains('Day').type('15')
      cy.contains('Month').type('8')
      cy.contains('Year').type('2021')

      cy.contains('Save and continue').click()
      cy.visit(`/referrals/${draftReferral.id}/further-information`)
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
          enforceableDays: true,
          completedDate: true,
          furtherInformation: true,
        })
        .checkYourAnswers({ checkAnswers: true })

      cy.stubGetDraftOasysRiskInformation(draftReferral.id, draftOasysRiskInformation.build())
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

      // Alex's risk information
      cy.contains('Additional information')
        .next()
        .should('contain', 'No more comments.')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/edit-oasys-risk-information`)

      // Alex's needs and requirements
      cy.contains('Additional information about Alex’s needs (optional)')
        .next()
        .should('contain', 'Alex is currently sleeping on her aunt’s sofa')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Does Alex have any other mobility, disability or accessibility needs? (optional)')
        .next()
        .should('contain', 'She uses a wheelchair')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Does Alex need an interpreter?')
        .next()
        .should('contain', 'Yes')
        .and('contain', 'Spanish')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Does Alex have caring or employment responsibilities?')
        .next()
        .should('contain', 'Yes')
        .and('contain', 'She works Mondays 9am - midday')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)

      // Sentence information
      cy.contains('.govuk-summary-list__key', 'Sentence')
        .next()
        .should('contain', 'Burglary')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.contains('Subcategory')
        .next()
        .should('contain', 'Theft act, 1968')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.contains('End of sentence date')
        .next()
        .should('contain', '15 November 2025')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/relevant-sentence`)

      // Accommodation referral details
      cy.contains('Accommodation referral details')
      cy.contains('Complexity level')
        .next()
        .should('contain', 'Low complexity')
        .and('contain', 'Info about low complexity')
        .next()
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/service-category/428ee70f-3001-4399-95a6-ad25eaaede16/complexity-level`
        )
      cy.contains('Desired outcomes')
        .next()
        .should('contain', 'Service user makes progress in obtaining accommodation')
        .and('contain', 'Service user is prevented from becoming homeless')
        .next()
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/service-category/428ee70f-3001-4399-95a6-ad25eaaede16/desired-outcomes`
        )

      cy.contains('Enforceable days')
        .next()
        .contains('Maximum number of enforceable days')
        .next()
        .should('contain', '10')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/enforceable-days`)

      cy.contains('Accommodation completion date')
        .next()
        .contains('Date')
        .next()
        .should('contain', '24 August 2021')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/completion-deadline`)

      cy.contains('Further information')
        .next()
        .contains('Further information for the provider')
        .next()
        .should('contain', 'Some information about Alex')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/further-information`)

      cy.contains('Submit referral').click()
      cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

      cy.contains('We’ve sent your referral to Harmony Living')
      cy.contains(sentReferral.referenceNumber)
    })
  })
  describe('for cohort referrals, when user tries to make a referral', () => {
    it('should be able to complete a cohort referral', () => {
      const socialInclusionServiceCategory = serviceCategoryFactory.build({
        id: 'c036826e-f077-49a5-8b33-601dca7ad479',
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
        id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
        serviceCategoryIds: null,
        interventionId: intervention.id,
        serviceProvider: {
          name: 'Harmony Living',
        },
      })

      const completedCurrentLocationDraftReferral = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          id: draftReferral.id,
          serviceCategoryIds: null,
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedServiceUserDetailsDraftReferral = draftReferralFactory
        .filledFormUpToCurrentLocation(
          [accommodationServiceCategory, socialInclusionServiceCategory],
          false,
          CurrentLocationType.community
        )
        .build({
          id: draftReferral.id,
          serviceCategoryIds: null,
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedSelectingServiceCategories = draftReferralFactory
        .filledFormUpToCurrentLocation(
          [accommodationServiceCategory, socialInclusionServiceCategory],
          false,
          CurrentLocationType.community
        )
        .selectedServiceCategories([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          id: draftReferral.id,
          interventionId: intervention.id,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedDraftReferral = draftReferralFactory
        .filledFormUpToFurtherInformation([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          id: draftReferral.id,
          interventionId: intervention.id,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build()
      const prisons = prisonFactory.prisonList()
      const responsibleOfficer = deliusResponsibleOfficerFactory.build()

      cy.stubGetServiceUserByCRN('X123456', deliusServiceUser)
      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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

      cy.contains('The person’s CRN').type('X123456')

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

      cy.contains('Confirm their personal details').click()

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
      cy.contains('Additional information')
      cy.withinFieldsetThatContains('Do you want to edit this OASys risk information for the Service Provider?', () => {
        cy.contains('Yes').click()
      })
      cy.stubPatchDraftOasysRiskInformation(draftReferral.id, draftOasysRiskInformation.build())
      cy.contains('Save and continue').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/edit-oasys-risk-information`)
      cy.get('#confirm-understood').click()
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

      cy.stubGetPrisons(prisons)
      cy.stubGetRamDeliusResponsibleOfficerForServiceUser(responsibleOfficer)
      cy.stubGetDraftReferral(draftReferral.id, completedCurrentLocationDraftReferral)
      cy.contains('Save and continue').click()

      // Submit current location Page
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/submit-current-location`)
      cy.get('h1').contains('Submit Alex River’s current location')

      cy.withinFieldsetThatContains('Where is Alex today?', () => {
        cy.contains('Community').click()
      })
      cy.stubGetDraftReferral(draftReferral.id, completedServiceUserDetailsDraftReferral)
      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/confirm-probation-practitioner-details`)

      cy.contains('No').click()
      cy.get('#probation-practitioner-name').type('John')
      cy.get('#probation-practitioner-pdu').type('Hackney and City')
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
          enforceableDays: false,
          completedDate: false,
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

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/enforceable-days`)
      cy.get('h1').contains('How many days will you use for this service?')
      cy.contains('How many days will you use for this service?').type('10')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/completion-deadline`)
      cy.get('h1').contains("What date does the Women's services intervention need to be completed by?")
      cy.contains('Day').type('15')
      cy.contains('Month').type('8')
      cy.contains('Year').type('2021')

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
          enforceableDays: true,
          completedDate: true,
          furtherInformation: true,
        })
        .checkYourAnswers({ checkAnswers: true })

      cy.stubGetDraftOasysRiskInformation(draftReferral.id, draftOasysRiskInformation.build())
      cy.get('a').contains('Check your answers').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-answers`)

      cy.contains('Service categories')
        .next()
        .contains('Selected service categories')
        .next()
        .should('contain', 'Accommodation')
        .and('contain', 'Social inclusion')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/service-categories`)

      cy.contains('Accommodation referral details')
        .next()
        .contains('Complexity level')
        .next()
        .should('contain', 'Low complexity')
        .and('contain', 'Info about low complexity')
        .next()
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/service-category/428ee70f-3001-4399-95a6-ad25eaaede16/complexity-level`
        )
      cy.contains('Accommodation referral details')
        .next()
        .contains('Desired outcomes')
        .next()
        .should('contain', 'Service user makes progress in obtaining accommodation')
        .and('contain', 'Service user is prevented from becoming homeless')
        .next()
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/service-category/428ee70f-3001-4399-95a6-ad25eaaede16/desired-outcomes`
        )

      cy.contains('Social inclusion referral details')
        .next()
        .contains('Complexity level')
        .next()
        .should('contain', 'Low complexity')
        .and('contain', 'Info about low complexity')
        .next()
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/service-category/c036826e-f077-49a5-8b33-601dca7ad479/complexity-level`
        )
      cy.contains('Social inclusion referral details')
        .next()
        .contains('Desired outcomes')
        .next()
        .should('contain', 'Service user develops and sustains social networks to reduce initial social isolation.')
        .and('contain', 'Service user secures early post-release engagement with community based services.')
        .and(
          'contain',
          'Service user develops resilience and perseverance to cope with challenges and barriers on return to the community.'
        )
        .next()
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/service-category/c036826e-f077-49a5-8b33-601dca7ad479/desired-outcomes`
        )

      cy.contains('Submit referral').click()
      cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

      cy.contains('We’ve sent your referral to Harmony Living')
      cy.contains(sentReferral.referenceNumber)
    })
  })
})
