import moment from 'moment-timezone'
import draftReferralFactory from '../../testutils/factories/draftReferral'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import interventionFactory from '../../testutils/factories/intervention'
import deliusResponsibleOfficerFactory from '../../testutils/factories/deliusResponsibleOfficer'
import ReferralSectionVerifier from './make_a_referral/referralSectionVerifier'
import riskSummaryFactory from '../../testutils/factories/riskSummary'
import draftOasysRiskInformation from '../../testutils/factories/draftOasysRiskInformation'
import pageFactory from '../../testutils/factories/page'
import { CurrentLocationType } from '../../server/models/draftReferral'
import caseConvictionsFactory from '../../testutils/factories/caseConvictions'
import caseConvictionFactory from '../../testutils/factories/caseConviction'
import prisonFactory from '../../testutils/factories/prison'
import secureChildrenAgenciesFactory from '../../testutils/factories/secureChildAgency'
import prisoner from '../../testutils/factories/prisoner'

describe('Referral form', () => {
  const deliusServiceUser = deliusServiceUserFactory.build()
  const caseConvictions = caseConvictionsFactory.build({
    convictions: [
      {
        id: 123456789,
        mainOffence: {
          category: 'Burglary',
          subCategory: 'Theft act, 1968',
        },
        sentence: {
          description: 'Absolute/Conditional Discharge',
          expectedEndDate: '2025-11-15',
        },
      },
    ],
  })
  const caseConviction = caseConvictionFactory.build({
    conviction: caseConvictions.convictions[0],
  })

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

      const completedPersonCurrentLocationType = draftReferralFactory
        .filledPersonalCurrentLocationType(CurrentLocationType.custody)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          serviceProvider: {
            name: 'Harmony Living',
          },
          interventionId: draftReferral.interventionId,
          allocatedCommunityPP: true,
        })

      const completedPPDetails = draftReferralFactory.filledFormUptoPPDetails().build({
        id: draftReferral.id,
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
        interventionId: draftReferral.interventionId,
        allocatedCommunityPP: true,
      })

      const completedNeedsAndRequirementsDraftReferral = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory])
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedExpectedReleaseDateDraftReferral = draftReferralFactory
        .filledFormUpToExpectedReleaseDate(CurrentLocationType.custody)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedEstablishmentDraftReferral = draftReferralFactory
        .filledFormUpToCurrentLocation(CurrentLocationType.custody)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedDraftReferral = draftReferralFactory
        .filledFormUpToFurtherInformation([accommodationServiceCategory], 'Some information about Alex')
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build({
        id: draftReferral.id,
      })

      const intervention = interventionFactory.build({ serviceCategories: [accommodationServiceCategory] })

      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategoryByIdAndContractReference(
        accommodationServiceCategory.id,
        completedNeedsAndRequirementsDraftReferral.dynamicFrameworkContractReference,
        accommodationServiceCategory
      )
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
      cy.stubGetDraftReferralsForUserToken([])
      cy.stubGetDraftReferral(draftReferral.id, draftReferral)
      cy.stubPatchDraftReferral(draftReferral.id, draftReferral)
      cy.stubSendDraftReferral(draftReferral.id, sentReferral)
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(deliusServiceUser.crn, deliusServiceUser)
      cy.stubGetConvictionsByCrn(caseConvictions.caseDetail.crn, caseConvictions)
      cy.stubGetConvictionByCrnAndId(caseConviction.caseDetail.crn, caseConviction.conviction.id, caseConviction)
      cy.stubGetIntervention(draftReferral.interventionId, intervention)
      cy.stubAddInterventionNewUser()
      cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
      cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)
      cy.stubGetRiskSummary(draftReferral.serviceUser.crn, riskSummaryFactory.build())
      cy.stubGetResponsibleOfficer(draftReferral.serviceUser.crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetPrisons(prisonFactory.build())
      cy.stubGetSecuredChildAgencies(secureChildrenAgenciesFactory.build())
      cy.stubGetPrisonerDetails(draftReferral.serviceUser.crn, prisoner.build())

      cy.login()

      const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

      cy.visit(`/intervention/${randomInterventionId}/refer`)

      cy.contains('The person’s CRN').type('X123456')
      cy.stubGetDraftReferral(draftReferral.id, completedPersonCurrentLocationType)

      cy.contains('Continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/community-allocated-form`)

      cy.get('[type="radio"]').check('yes')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/referral-type-form`)

      cy.get('[type="radio"]').check('CUSTODY')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'NOT STARTED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: false,
          establishmentStatus: 'NOT STARTED',
          expectedReleaseDate: false,
          expectedReleaseDateStatus: 'NOT STARTED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: false,
          confirmServiceUserDetailsStatus: 'NOT STARTED',
          riskInformation: false,
          riskInformationStatus: 'NOT STARTED',
          needsAndRequirements: false,
          needsAndRequirementsStatus: 'NOT STARTED',
        })
        .interventionReferralDetails({
          relevantSentence: false,
          relevantSentenceStatus: 'CANNOT START YET',
          requiredComplexityLevel: false,
          requiredComplexityLevelStatus: 'CANNOT START YET',
          desiredOutcomes: false,
          desiredOutcomesStatus: 'CANNOT START YET',
          enforceableDays: false,
          enforceableDaysStatus: 'CANNOT START YET',
          completedDate: false,
          completedDateStatus: 'CANNOT START YET',
          furtherInformation: false,
          furtherInformationStatus: 'CANNOT START YET',
        })
        .checkAllReferralInformation({
          checkAllReferralInformation: false,
          checkAllReferralInformationStatus: 'CANNOT START YET',
        })
      cy.contains(`Alex River (CRN: ${completedPersonCurrentLocationType.serviceUser.crn})`)

      cy.contains('Name, email address and location').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/confirm-probation-practitioner-details`)
      cy.contains(`Alex River (CRN: ${completedPersonCurrentLocationType.serviceUser.crn})`)
      cy.contains(`Confirm probation practitioner details`)
      cy.stubGetDraftReferral(draftReferral.id, completedPPDetails)
      cy.contains('Save and continue').click()

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'NOT STARTED',
          expectedReleaseDate: false,
          expectedReleaseDateStatus: 'NOT STARTED',
        })

      cy.contains('Establishment').click()
      // Submit current location Page
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/submit-current-location`)
      cy.contains(`Alex River (CRN: ${completedPPDetails.serviceUser.crn})`)
      cy.get('h1').contains('Confirm Alex River’s current location')
      cy.contains('Which prison establishment is Alex in?')
      cy.contains('Start typing then choose prison name from the list.')
      cy.get('#prison-select').type('London')
      cy.stubGetDraftReferral(draftReferral.id, completedEstablishmentDraftReferral)
      cy.contains('Save and continue').click()

      // Submit expected release date
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/expected-release-date`)
      cy.get('h1').contains(`Confirm Alex River's expected release date`)
      cy.contains('Choose a different date').click()
      cy.contains('Save and continue').click()
      const tomorrow = moment().add(1, 'days')
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/change-expected-release-date`)
      cy.contains('Day').type(tomorrow.format('DD'))
      cy.contains('Month').type(tomorrow.format('MM'))
      cy.contains('Year').type(tomorrow.format('YYYY'))

      cy.stubGetDraftReferral(draftReferral.id, completedExpectedReleaseDateDraftReferral)
      cy.contains('Save and continue').click()

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'COMPLETED',
          expectedReleaseDate: true,
          expectedReleaseDateStatus: 'COMPLETED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          confirmServiceUserDetailsStatus: 'NOT STARTED',
          riskInformation: false,
          riskInformationStatus: 'NOT STARTED',
          needsAndRequirements: false,
          needsAndRequirementsStatus: 'NOT STARTED',
        })

      cy.contains('Personal details').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/service-user-details`)
      cy.contains(`Alex River (CRN: ${completedExpectedReleaseDateDraftReferral.serviceUser.crn})`)
      cy.get('h1').contains("Review Alex River's information")
      cy.contains('X123456')
      cy.contains('River')
      cy.contains('1 Jan 1980')
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
      cy.contains('Address and contact details')
      cy.contains('Email address')
      cy.contains('alex.river@example.com')
      cy.contains('Phone number')
      cy.contains('0123456789')

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
      cy.stubGetDraftReferral(draftReferral.id, completedNeedsAndRequirementsDraftReferral)
      cy.contains('Save and continue').click()

      // Service Category details Section
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'COMPLETED',
          expectedReleaseDate: true,
          expectedReleaseDateStatus: 'COMPLETED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          confirmServiceUserDetailsStatus: 'COMPLETED',
          riskInformation: true,
          riskInformationStatus: 'COMPLETED',
          needsAndRequirements: true,
          needsAndRequirementsStatus: 'COMPLETED',
        })
        .interventionReferralDetails({
          relevantSentence: true,
          relevantSentenceStatus: 'NOT STARTED',
          requiredComplexityLevel: false,
          requiredComplexityLevelStatus: 'NOT STARTED',
          desiredOutcomes: false,
          desiredOutcomesStatus: 'NOT STARTED',
          enforceableDays: false,
          enforceableDaysStatus: 'NOT STARTED',
          completedDate: false,
          completedDateStatus: 'NOT STARTED',
          furtherInformation: false,
          furtherInformationStatus: 'NOT STARTED',
        })
        .checkAllReferralInformation({
          checkAllReferralInformation: false,
          checkAllReferralInformationStatus: 'CANNOT START YET',
        })

      cy.contains('Confirm the relevant sentence for the Accommodation referral').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.contains(`Alex River (CRN: ${completedNeedsAndRequirementsDraftReferral.serviceUser.crn})`)
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
      cy.visit(`/referrals/${draftReferral.id}/reason-for-referral`)
      cy.get('h1').contains('Provide the reason for this referral and further information for the service provider')
      cy.get('#reason-for-referral').type('Some information about Alex')
      cy.get('#reason-for-referral-further-information').type('Some information about Alex')

      // stub completed draft referral to mark section as completed
      cy.stubGetDraftReferral(draftReferral.id, completedDraftReferral)

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'COMPLETED',
          expectedReleaseDate: true,
          expectedReleaseDateStatus: 'COMPLETED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          confirmServiceUserDetailsStatus: 'COMPLETED',
          riskInformation: true,
          riskInformationStatus: 'COMPLETED',
          needsAndRequirements: true,
          needsAndRequirementsStatus: 'COMPLETED',
        })
        .interventionReferralDetails({
          relevantSentence: true,
          relevantSentenceStatus: 'COMPLETED',
          requiredComplexityLevel: true,
          requiredComplexityLevelStatus: 'COMPLETED',
          desiredOutcomes: true,
          desiredOutcomesStatus: 'COMPLETED',
          enforceableDays: true,
          enforceableDaysStatus: 'COMPLETED',
          completedDate: true,
          completedDateStatus: 'COMPLETED',
          furtherInformation: true,
          furtherInformationStatus: 'COMPLETED',
        })
        .checkAllReferralInformation({
          checkAllReferralInformation: true,
          checkAllReferralInformationStatus: 'NOT STARTED',
        })
      cy.stubGetDraftOasysRiskInformation(draftReferral.id, draftOasysRiskInformation.build())
      cy.get('a').contains('Check referral information').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-all-referral-information`)

      cy.contains('X123456')
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

      // Alex's personal information
      cy.contains('Identity details')
        .parent()
        .next()
        .should('contain', 'First name')
        .should('contain', 'Alex')
        .should('contain', 'Last name')
        .should('contain', 'River')
        .should('contain', 'CRN')
        .should('contain', 'X123456')
      // Sentence information
      cy.contains('Intervention details')
        .parent()
        .next()
        .should('contain', 'Intervention type')
        .should('contain', `Accommodation`)
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
        .should('contain', '15 Nov 2025')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/relevant-sentence`)
      cy.contains('Maximum number of enforceable days')
        .next()
        .should('contain', '10')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/enforceable-days`)
      cy.contains('Date intervention to be completed by')
        .next()
        .contains('24 Aug 2021')
        .parent()
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/completion-deadline`)
      cy.contains('Reason for referral and referral details')
        .next()
        .should('contain', 'Some information about Alex')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/reason-for-referral?amendPPDetails=true`)

      cy.contains('Probation practitioner details')
        .parent()
        .next()
        .children()
        .children()
        .should('contain', 'Name')
        .should('contain', 'Bob Alice')
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/update-probation-practitioner-name?amendPPDetails=true`
        )

      cy.contains('Probation practitioner details')
        .parent()
        .next()
        .children()
        .children()
        .next()
        .should('contain', 'Email address')
        .should('contain', 'bobalice@example.com')
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/update-probation-practitioner-email-address?amendPPDetails=true`
        )

      cy.contains('Probation practitioner details')
        .parent()
        .next()
        .children()
        .children()
        .next()
        .next()
        .should('contain', 'Phone number')
        .should('contain', '073232323232')
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/update-probation-practitioner-phone-number?amendPPDetails=true`
        )

      cy.contains('Probation practitioner details')
        .parent()
        .next()
        .should('contain', 'PDU (Probation Delivery Unit)')
        .should('contain', '97 Hackney and City')
        .contains('Change')

      cy.contains('Probation practitioner details')
        .parent()
        .next()
        .children()
        .children()
        .next()
        .next()
        .next()
        .next()
        .should('contain', 'Team phone number')
        .should('contain', '020343434343')
        .contains('Change')
        .should(
          'have.attr',
          'href',
          `/referrals/${draftReferral.id}/update-probation-practitioner-team-phone-number?amendPPDetails=true`
        )

      // Back up contact for the referral
      cy.contains('Back up contact for the referral')
        .parent()
        .next()
        .should('contain', 'Referring officer')
        .should('contain', 'USER1')

      cy.contains('Back up contact for the referral')
        .parent()
        .next()
        .should('contain', 'Email address')
        .should('contain', 'a.b@xyz.com')

      // Alex's needs and requirements
      cy.contains('Identify needs')
        .next()
        .should('contain', 'Alex is currently sleeping on her aunt’s sofa')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Mobility, disability or accessibility needs')
        .next()
        .should('contain', 'She uses a wheelchair')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Interpreter required')
        .next()
        .should('contain', 'Yes')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Interpreter language')
        .next()
        .should('contain', 'Spanish')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)
      cy.contains('Caring or employment responsibilities')
        .next()
        .should('contain', 'Yes')
        .and('contain', 'She works Mondays 9am - midday')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/needs-and-requirements`)

      // Accommodation referral details
      cy.contains('Accommodation intervention')
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

      // Alex's risk information
      cy.contains(`Alex River’s OAsys risk information`)
        .parent()
        .next()
        .children()
        .should('contain', 'Additional risk information')
        .should('contain', 'No more comments.')
        .should('contain', 'Change')

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

      const completedPersonCurrentLocationType = draftReferralFactory
        .filledPersonalCurrentLocationType(CurrentLocationType.custody)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          serviceProvider: {
            name: 'Harmony Living',
          },
          interventionId: draftReferral.interventionId,
          allocatedCommunityPP: true,
        })

      const completedPPDetails = draftReferralFactory.filledFormUptoPPDetails().build({
        id: draftReferral.id,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
        interventionId: draftReferral.interventionId,
        allocatedCommunityPP: true,
      })

      const completedNeedsAndRequirementsDraftReferral = draftReferralFactory
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedExpectedReleaseDateDraftReferral = draftReferralFactory
        .filledFormUpToExpectedReleaseDate(CurrentLocationType.custody)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedEstablishmentDraftReferral = draftReferralFactory
        .filledFormUpToCurrentLocation(CurrentLocationType.custody)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedDraftReferral = draftReferralFactory
        .filledFormUpToFurtherInformation(
          [accommodationServiceCategory, socialInclusionServiceCategory],
          'Some information about Alex'
        )
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedSelectingServiceCategories = draftReferralFactory
        .filledFormUpToNeedsAndRequirements(
          [accommodationServiceCategory, socialInclusionServiceCategory],
          false,
          CurrentLocationType.custody
        )
        .selectedServiceCategories([accommodationServiceCategory, socialInclusionServiceCategory])
        .build({
          id: draftReferral.id,
          interventionId: intervention.id,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build()
      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategoryByIdAndContractReference(
        accommodationServiceCategory.id,
        completedSelectingServiceCategories.dynamicFrameworkContractReference,
        accommodationServiceCategory
      )
      cy.stubGetServiceCategoryByIdAndContractReference(
        socialInclusionServiceCategory.id,
        completedSelectingServiceCategories.dynamicFrameworkContractReference,
        socialInclusionServiceCategory
      )
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
      cy.stubGetDraftReferralsForUserToken([])
      cy.stubGetDraftReferral(draftReferral.id, draftReferral)
      cy.stubPatchDraftReferral(draftReferral.id, draftReferral)
      cy.stubSendDraftReferral(draftReferral.id, sentReferral)
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(deliusServiceUser.crn, deliusServiceUser)
      cy.stubGetConvictionsByCrn(caseConvictions.caseDetail.crn, caseConvictions)
      cy.stubGetConvictionByCrnAndId(caseConviction.caseDetail.crn, caseConviction.conviction.id, caseConviction)
      cy.stubGetIntervention(draftReferral.interventionId, intervention)
      cy.stubAddInterventionNewUser()
      cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
      cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)
      cy.stubGetRiskSummary(draftReferral.serviceUser.crn, riskSummaryFactory.build())
      cy.stubGetResponsibleOfficer(draftReferral.serviceUser.crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetPrisons(prisonFactory.build())
      cy.stubGetSecuredChildAgencies(secureChildrenAgenciesFactory.build())
      cy.stubGetPrisonerDetails(draftReferral.serviceUser.crn, prisoner.build())

      cy.login()

      const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

      cy.visit(`/intervention/${randomInterventionId}/refer`)

      cy.contains('The person’s CRN').type('X123456')

      cy.contains('Continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/community-allocated-form`)

      cy.get('[type="radio"]').check('yes')

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/referral-type-form`)

      cy.get('[type="radio"]').check('CUSTODY')

      cy.stubGetDraftReferral(draftReferral.id, completedPersonCurrentLocationType)
      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)
      cy.contains(`Alex River (CRN: ${completedPersonCurrentLocationType.serviceUser.crn})`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'NOT STARTED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: false,
          establishmentStatus: 'NOT STARTED',
          expectedReleaseDate: false,
          expectedReleaseDateStatus: 'NOT STARTED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: false,
          confirmServiceUserDetailsStatus: 'NOT STARTED',
          riskInformation: false,
          riskInformationStatus: 'NOT STARTED',
          needsAndRequirements: false,
          needsAndRequirementsStatus: 'NOT STARTED',
        })
        .selectServiceCategories({ selectServiceCategories: false, selectServiceCategoriesStatus: 'CANNOT START YET' })
        .disabledCohortInterventionReferralDetails()
        .checkAllReferralInformation({
          checkAllReferralInformation: false,
          checkAllReferralInformationStatus: 'CANNOT START YET',
        })

      cy.contains('Name, email address and location').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/confirm-probation-practitioner-details`)
      cy.contains(`Alex River (CRN: ${completedPersonCurrentLocationType.serviceUser.crn})`)
      cy.stubGetDraftReferral(draftReferral.id, completedPPDetails)
      cy.contains('Save and continue').click()

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'NOT STARTED',
          expectedReleaseDate: false,
          expectedReleaseDateStatus: 'NOT STARTED',
        })

      cy.contains('Establishment').click()
      // Submit current location Page
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/submit-current-location`)
      cy.get('h1').contains('Confirm Alex River’s current location')

      cy.contains('Which prison establishment is Alex in?')
      cy.contains('Start typing then choose prison name from the list.')
      cy.get('#prison-select').type('London')
      cy.stubGetDraftReferral(draftReferral.id, completedEstablishmentDraftReferral)
      cy.contains('Save and continue').click()

      // Submit expected release date
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/expected-release-date`)
      cy.get('h1').contains(`Confirm Alex River's expected release date`)
      cy.contains('Choose a different date').click()
      cy.contains('Save and continue').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/change-expected-release-date`)
      const tomorrow = moment().add(1, 'days')
      cy.contains('Day').type(tomorrow.format('DD'))
      cy.contains('Month').type(tomorrow.format('MM'))
      cy.contains('Year').type(tomorrow.format('YYYY'))

      cy.stubGetDraftReferral(draftReferral.id, completedExpectedReleaseDateDraftReferral)
      cy.contains('Save and continue').click()

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'COMPLETED',
          expectedReleaseDate: true,
          expectedReleaseDateStatus: 'COMPLETED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          confirmServiceUserDetailsStatus: 'NOT STARTED',
          riskInformation: false,
          riskInformationStatus: 'NOT STARTED',
          needsAndRequirements: false,
          needsAndRequirementsStatus: 'NOT STARTED',
        })

      cy.contains('Personal details').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/service-user-details`)
      cy.get('h1').contains("Review Alex River's information")
      cy.contains('X123456')
      cy.contains('River')
      cy.contains('1 Jan 1980')
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
      cy.contains('Address and contact details')
      cy.contains('Email address')
      cy.contains('alex.river@example.com')
      cy.contains('Phone number')
      cy.contains('0123456789')

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
      cy.stubGetDraftReferral(draftReferral.id, completedNeedsAndRequirementsDraftReferral)
      cy.contains('Save and continue').click()

      // Service Category details Section
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'COMPLETED',
          expectedReleaseDate: true,
          expectedReleaseDateStatus: 'COMPLETED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          confirmServiceUserDetailsStatus: 'COMPLETED',
          riskInformation: true,
          riskInformationStatus: 'COMPLETED',
          needsAndRequirements: true,
          needsAndRequirementsStatus: 'COMPLETED',
        })
        .selectServiceCategories({ selectServiceCategories: true, selectServiceCategoriesStatus: 'COMPLETED' })
        .cohortInterventionReferralDetails({
          relevantSentence: true,
          relevantSentenceStatus: 'NOT STARTED',
          requiredComplexityLevel1: false,
          requiredComplexityLevel1Status: 'NOT STARTED',
          desiredOutcomes1: false,
          desiredOutcomes1Status: 'NOT STARTED',
          requiredComplexityLevel2: false,
          requiredComplexityLevel2Status: 'NOT STARTED',
          desiredOutcomes2: false,
          desiredOutcomes2Status: 'NOT STARTED',
          enforceableDays: false,
          enforceableDaysStatus: 'NOT STARTED',
          completedDate: false,
          completedDateStatus: 'NOT STARTED',
          furtherInformation: false,
          furtherInformationStatus: 'NOT STARTED',
        })
        .checkAllReferralInformation({
          checkAllReferralInformation: false,
          checkAllReferralInformationStatus: 'CANNOT START YET',
        })

      cy.stubGetDraftReferral(draftReferral.id, completedSelectingServiceCategories)
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

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/reason-for-referral`)
      cy.get('h1').contains('Provide the reason for this referral and further information for the service provider')
      cy.get('#reason-for-referral').type('Some information about Alex')
      cy.get('#reason-for-referral-further-information').type('Some information about Alex')

      // stub completed draft referral to mark section as completed
      cy.stubGetDraftReferral(draftReferral.id, completedDraftReferral)

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocationAndExpectedReleaseDate({
          establishment: true,
          establishmentStatus: 'COMPLETED',
          expectedReleaseDate: true,
          expectedReleaseDateStatus: 'COMPLETED',
        })
        .reviewServiceUserInformation({
          confirmServiceUserDetails: true,
          confirmServiceUserDetailsStatus: 'COMPLETED',
          riskInformation: true,
          riskInformationStatus: 'COMPLETED',
          needsAndRequirements: true,
          needsAndRequirementsStatus: 'COMPLETED',
        })
        .selectServiceCategories({ selectServiceCategories: true, selectServiceCategoriesStatus: 'COMPLETED' })
        .cohortInterventionReferralDetails({
          relevantSentence: true,
          relevantSentenceStatus: 'COMPLETED',
          requiredComplexityLevel1: true,
          requiredComplexityLevel1Status: 'COMPLETED',
          desiredOutcomes1: true,
          desiredOutcomes1Status: 'COMPLETED',
          requiredComplexityLevel2: true,
          requiredComplexityLevel2Status: 'COMPLETED',
          desiredOutcomes2: true,
          desiredOutcomes2Status: 'COMPLETED',
          enforceableDays: true,
          enforceableDaysStatus: 'COMPLETED',
          completedDate: true,
          completedDateStatus: 'COMPLETED',
          furtherInformation: true,
          furtherInformationStatus: 'COMPLETED',
        })
        .checkAllReferralInformation({
          checkAllReferralInformation: true,
          checkAllReferralInformationStatus: 'NOT STARTED',
        })

      cy.stubGetDraftOasysRiskInformation(draftReferral.id, draftOasysRiskInformation.build())
      cy.get('a').contains('Check referral information').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/check-all-referral-information`)

      cy.contains(`Women's services intervention`)
      cy.contains('Selected services')
        .next()
        .should('contain', 'Accommodation')
        .and('contain', 'Social inclusion')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/service-categories`)

      cy.contains('Accommodation service')
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
      cy.contains('Accommodation service')
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

      cy.contains('Social inclusion service')
        .parent()
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
      cy.contains('Social inclusion service')
        .parent()
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
