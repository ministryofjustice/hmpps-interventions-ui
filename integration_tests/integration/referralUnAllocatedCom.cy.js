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
    it('User starts a referral for a unallocated COM, fills in the form, and submits it', () => {
      cy.viewport(1536, 960)
      const draftReferral = draftReferralFactory.serviceUserSelected().build({
        id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
      })

      const completedWhetherReferralReleasingIn12Weeks = draftReferralFactory
        .filledWhetherReferralReleaseWithIn12Weeks()
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          serviceProvider: {
            name: 'Harmony Living',
          },
          interventionId: draftReferral.interventionId,
        })

      const completedPPDetails = draftReferralFactory.filledMainPointOfContactDetails().build({
        id: draftReferral.id,
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
        interventionId: draftReferral.interventionId,
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
        .filledMainPointOfContactDetails()
        .filledFormUpToFurtherInformation([accommodationServiceCategory], 'Some information about Alex')
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
          isReferralReleasingIn12Weeks: true,
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build({
        id: draftReferral.id,
      })

      const intervention = interventionFactory.build({ serviceCategories: [accommodationServiceCategory] })

      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
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
      cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
      cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)
      cy.stubGetRiskSummary(draftReferral.serviceUser.crn, riskSummaryFactory.build())
      cy.stubGetResponsibleOfficer(
        draftReferral.serviceUser.crn,
        deliusResponsibleOfficerFactory.build({
          communityManager: {
            code: 'abc',
            name: {
              forename: 'Bob',
              surname: 'Alice',
            },
            username: 'bobalice',
            email: 'bobalice@example.com',
            telephoneNumber: '98454243243',
            responsibleOfficer: false,
            pdu: {
              code: '97',
              description: 'Hackney and City',
            },
            team: {
              code: 'RM',
              description: 'R and M team',
              email: 'r.m@digital.justice.gov.uk',
              telephoneNumber: '044-2545453442',
            },
            unallocated: true,
          },
        })
      )

      cy.login()

      const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

      cy.visit(`/intervention/${randomInterventionId}/refer`)

      cy.contains('The person’s CRN').type('X123456')
      cy.stubGetDraftReferral(draftReferral.id, draftReferral)

      cy.contains('Continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/prison-release-form`)

      cy.get('[type="radio"]').check('yes')
      cy.stubGetDraftReferral(draftReferral.id, completedWhetherReferralReleasingIn12Weeks)

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
      cy.contains(`Alex River (CRN: ${completedWhetherReferralReleasingIn12Weeks.serviceUser.crn})`)

      cy.contains('Name, email address and location').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/confirm-main-point-of-contact`)
      cy.contains(`Alex River (CRN: ${completedWhetherReferralReleasingIn12Weeks.serviceUser.crn})`)
      cy.contains('Name').type('Alex River')
      cy.contains('Role / job title').type('Probation Practitoner')
      cy.contains('Email address').type('a.b@xyz.com')
      cy.get('[type="radio"]').check('establishment')
      cy.get('#prison-select').type('Bedford (HMP & YOI)')
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

      cy.contains('Which establishment is Alex in?')
      cy.contains('Start typing prison name, then choose from the list.')
      cy.get('#prison-select').type('Aylesbury (HMYOI)')
      cy.stubGetDraftReferral(draftReferral.id, completedEstablishmentDraftReferral)
      cy.contains('Save and continue').click()

      // Submit expected release date
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/expected-release-date`)
      cy.get('h1').contains(`Confirm Alex River's expected release date`)
      cy.contains('Yes').click()
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
      cy.visit(`/referrals/${draftReferral.id}/further-information`)
      cy.get('h1').contains(
        'Do you have further information for the Accommodation referral service provider? (optional)'
      )
      cy.get('textarea').type('Some information about Alex')

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

      // Alex's risk information
      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Name')
        .should('contain', 'Bob Alice')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)

      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Role / job title')
        .should('contain', 'Probation practitioner')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)

      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Email address')
        .should('contain', 'bobalice@example.com')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)

      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Establishment')
        .should('contain', 'Bedford (HMP & YOI)')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)

      //
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
      cy.contains('Further information for the service provider')
        .next()
        .should('contain', 'Some information about Alex')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/further-information`)

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
      cy.contains('Submit referral').click()
      cy.location('pathname').should('equal', `/referrals/${sentReferral.id}/confirmation`)

      cy.contains('We’ve sent your referral to Harmony Living')
      cy.contains(sentReferral.referenceNumber)
    })
    it('User starts a referral for a unallocated COM, but does not the release date, fills in the form, and submits it', () => {
      cy.viewport(1536, 960)
      const draftReferral = draftReferralFactory.serviceUserSelected().build({
        id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
      })

      const completedWhetherReferralReleasingIn12Weeks = draftReferralFactory
        .filledWhetherReferralReleaseWithIn12Weeks(false)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          serviceProvider: {
            name: 'Harmony Living',
          },
          interventionId: draftReferral.interventionId,
        })

      const completedPPDetails = draftReferralFactory.filledMainPointOfContactDetails(false).build({
        id: draftReferral.id,
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
        interventionId: draftReferral.interventionId,
      })

      const completedNeedsAndRequirementsDraftReferral = draftReferralFactory
        .filledMainPointOfContactDetails(false)
        .filledFormUpToNeedsAndRequirements([accommodationServiceCategory])
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
          isReferralReleasingIn12Weeks: false,
        })

      const completedEstablishmentDraftReferral = draftReferralFactory
        .filledMainPointOfContactDetails(false)
        .filledFormUpToCurrentLocationForUnallocatedCOM(false)
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          interventionId: draftReferral.interventionId,
          serviceProvider: {
            name: 'Harmony Living',
          },
        })

      const completedDraftReferral = draftReferralFactory
        .filledMainPointOfContactDetails(false)
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
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
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
      cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
      cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)
      cy.stubGetRiskSummary(draftReferral.serviceUser.crn, riskSummaryFactory.build())
      cy.stubGetResponsibleOfficer(
        draftReferral.serviceUser.crn,
        deliusResponsibleOfficerFactory.build({
          communityManager: {
            code: 'abc',
            name: {
              forename: 'Bob',
              surname: 'Alice',
            },
            username: 'bobalice',
            email: 'bobalice@example.com',
            telephoneNumber: '98454243243',
            responsibleOfficer: false,
            pdu: {
              code: '97',
              description: 'Hackney and City',
            },
            team: {
              code: 'RM',
              description: 'R and M team',
              email: 'r.m@digital.justice.gov.uk',
              telephoneNumber: '044-2545453442',
            },
            unallocated: true,
          },
        })
      )

      cy.login()

      const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

      cy.visit(`/intervention/${randomInterventionId}/refer`)

      cy.contains('The person’s CRN').type('X123456')
      cy.stubGetDraftReferral(draftReferral.id, draftReferral)

      cy.contains('Continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/prison-release-form`)

      cy.get('[type="radio"]').check('no')
      cy.stubGetDraftReferral(draftReferral.id, completedWhetherReferralReleasingIn12Weeks)

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'NOT STARTED',
        })
        .reviewCurrentLocation({
          establishment: false,
          establishmentStatus: 'NOT STARTED',
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
      cy.contains(`Alex River (CRN: ${completedWhetherReferralReleasingIn12Weeks.serviceUser.crn})`)

      cy.contains('Name, email address and location').click()
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/confirm-main-point-of-contact`)
      cy.contains(`Alex River (CRN: ${completedWhetherReferralReleasingIn12Weeks.serviceUser.crn})`)
      cy.contains('Name').type('Alex River')
      cy.contains('Role / job title').type('Probation Practitoner')
      cy.contains('Email address').type('a.b@xyz.com')
      cy.get('[type="radio"]').check('establishment')
      cy.get('#prison-select').type('Bedford (HMP & YOI)')
      cy.stubGetDraftReferral(draftReferral.id, completedPPDetails)
      cy.contains('Save and continue').click()

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocation({
          establishment: true,
          establishmentStatus: 'NOT STARTED',
        })

      cy.contains('Establishment').click()
      // Submit current location Page
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/submit-current-location`)
      cy.contains(`Alex River (CRN: ${completedPPDetails.serviceUser.crn})`)
      cy.get('h1').contains('Confirm Alex River’s current location')

      cy.contains('Which establishment is Alex in?')
      cy.contains('Start typing prison name, then choose from the list.')
      cy.get('#prison-select').type('Aylesbury (HMYOI)')
      cy.stubGetDraftReferral(draftReferral.id, completedEstablishmentDraftReferral)
      cy.contains('Save and continue').click()

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocation({
          establishment: true,
          establishmentStatus: 'COMPLETED',
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
      cy.contains(`Alex River (CRN: ${completedEstablishmentDraftReferral.serviceUser.crn})`)
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
        .reviewCurrentLocation({
          establishment: true,
          establishmentStatus: 'COMPLETED',
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
      cy.visit(`/referrals/${draftReferral.id}/further-information`)
      cy.get('h1').contains(
        'Do you have further information for the Accommodation referral service provider? (optional)'
      )
      cy.get('textarea').type('Some information about Alex')

      // stub completed draft referral to mark section as completed
      cy.stubGetDraftReferral(draftReferral.id, completedDraftReferral)

      cy.contains('Save and continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/form`)

      ReferralSectionVerifier.verifySection
        .reviewPPDetails({
          ppDetails: true,
          ppDetailsStatus: 'COMPLETED',
        })
        .reviewCurrentLocation({
          establishment: true,
          establishmentStatus: 'COMPLETED',
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

      // Alex's risk information
      // Alex's risk information
      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Name')
        .should('contain', 'Bob Alice')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)

      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Role / job title')
        .should('contain', 'Probation practitioner')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)

      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Email')
        .should('contain', 'bobalice@example.com')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)

      cy.contains('Main point of contact details')
        .parent()
        .next()
        .should('contain', 'Establishment')
        .should('contain', 'Bedford (HMP & YOI)')
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/confirm-main-point-of-contact?amendPPDetails=true`)
      //
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
      cy.contains('Further information for the service provider')
        .next()
        .should('contain', 'Some information about Alex')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/further-information`)

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

      const completedWhetherReferralReleasingIn12Weeks = draftReferralFactory
        .filledWhetherReferralReleaseWithIn12Weeks()
        .build({
          id: draftReferral.id,
          serviceCategoryIds: [accommodationServiceCategory.id],
          serviceProvider: {
            name: 'Harmony Living',
          },
          interventionId: draftReferral.interventionId,
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
        })

      const completedPPDetails = draftReferralFactory.filledMainPointOfContactDetails().build({
        id: draftReferral.id,
        serviceCategoryIds: [accommodationServiceCategory.id],
        serviceProvider: {
          name: 'Harmony Living',
        },
        interventionId: draftReferral.interventionId,
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
        .filledMainPointOfContactDetails()
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
        .filledMainPointOfContactDetails()
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
          isReferralReleasingIn12Weeks: true,
        })

      const sentReferral = sentReferralFactory.fromFields(completedDraftReferral).build()

      cy.stubCreateDraftReferral(draftReferral)
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
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
      cy.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, draftReferral)
      cy.stubSetComplexityLevelForServiceCategory(draftReferral.id, draftReferral)
      cy.stubGetRiskSummary(draftReferral.serviceUser.crn, riskSummaryFactory.build())
      cy.stubGetResponsibleOfficer(
        draftReferral.serviceUser.crn,
        deliusResponsibleOfficerFactory.build({
          communityManager: {
            code: 'abc',
            name: {
              forename: 'Bob',
              surname: 'Alice',
            },
            username: 'bobalice',
            email: 'bobalice@example.com',
            telephoneNumber: '98454243243',
            responsibleOfficer: false,
            pdu: {
              code: '97',
              description: 'Hackney and City',
            },
            team: {
              code: 'RM',
              description: 'R and M team',
              email: 'r.m@digital.justice.gov.uk',
              telephoneNumber: '044-2545453442',
            },
            unallocated: true,
          },
        })
      )

      cy.login()

      const randomInterventionId = '99ee16d3-130a-4d8f-97c5-f1a42119a382'

      cy.visit(`/intervention/${randomInterventionId}/refer`)

      cy.contains('The person’s CRN').type('X123456')

      cy.contains('Continue').click()

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/prison-release-form`)

      cy.get('[type="radio"]').check('no')
      cy.stubGetDraftReferral(draftReferral.id, completedWhetherReferralReleasingIn12Weeks)

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
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/confirm-main-point-of-contact`)
      cy.contains(`Alex River (CRN: ${completedWhetherReferralReleasingIn12Weeks.serviceUser.crn})`)
      cy.contains('Name').type('Alex River')
      cy.contains('Role / job title').type('Probation Practitoner')
      cy.contains('Email address').type('a.b@xyz.com')
      cy.get('[type="radio"]').check('establishment')
      cy.get('#prison-select').type('Bedford (HMP & YOI)')
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

      cy.contains('Which establishment is Alex in?')
      cy.contains('Start typing prison name, then choose from the list.')
      cy.get('#prison-select').type('Aylesbury (HMYOI)')
      cy.stubGetDraftReferral(draftReferral.id, completedEstablishmentDraftReferral)
      cy.contains('Save and continue').click()

      // Submit expected release date
      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/expected-release-date`)
      cy.get('h1').contains(`Confirm Alex River's expected release date`)
      cy.contains('Yes').click()
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

      cy.location('pathname').should('equal', `/referrals/${draftReferral.id}/further-information`)
      cy.get('h1').contains(
        "Do you have further information for the Women's services referral service provider? (optional)"
      )
      cy.get('textarea').type('Some information about Alex')

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

      cy.contains('Service categories')
      cy.contains('Selected service categories')
        .next()
        .should('contain', 'Accommodation')
        .and('contain', 'Social inclusion')
        .next()
        .contains('Change')
        .should('have.attr', 'href', `/referrals/${draftReferral.id}/service-categories`)

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
      cy.contains('Accommodation referral details')
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

      cy.contains('Social inclusion referral details')
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
      cy.contains('Social inclusion referral details')
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
