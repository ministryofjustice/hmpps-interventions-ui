import moment from 'moment-timezone'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import deliusServiceUser from '../../testutils/factories/deliusServiceUser'
import intervention from '../../testutils/factories/intervention'
import ramDeliusUserFactory from '../../testutils/factories/ramDeliusUser'
import supplementaryRiskInformation from '../../testutils/factories/supplementaryRiskInformation'
import riskSummary from '../../testutils/factories/riskSummary'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusResponsibleOfficerFactory from '../../testutils/factories/deliusResponsibleOfficer'
import caseConvictionFactory from '../../testutils/factories/caseConviction'
import secureChildAgency from '../../testutils/factories/secureChildAgency'
import prisoner from '../../testutils/factories/prisoner'

context('Amend a referral', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  describe('updating maximum enforceable days ', () => {
    const sentReferral = sentReferralFactory.build()
    const stubCallsForUpdateReferralPage = () => {
      cy.stubUpdateSentReferralDetails(sentReferral.id, { referralId: sentReferral.id })
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetIntervention(sentReferral.referral.interventionId, intervention.build())
      cy.stubAddInterventionNewUser()
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetRiskSummary(crn, riskSummary.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', 'enforceable days').next().next().contains('Change').click()
        cy.contains('How many days will you use for this service?')
      })

      it('shows the existing number of days in the form', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.get('input[name="maximum-enforceable-days"]').should(
          'have.value',
          sentReferral.referral.maximumEnforceableDays.toString()
        )
      })

      it('redirects to referral details on submission', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.contains('What is the reason for changing the maximum number of days?').type('reason')
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the reason for change is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.contains('What is the reason for changing the maximum number of days?').type('    ')
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('A reason for changing the referral must be supplied')
        cy.contains('What is the reason for changing the maximum number of days?')
          .next()
          .contains('A reason for changing the referral must be supplied')
      })

      it('shows a validation error if the number of days is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.get('input[name="maximum-enforceable-days"]').clear()
        cy.contains('What is the reason for changing the maximum number of days?').type('something')
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('Enter the maximum number of enforceable days')
        cy.get('input[name="maximum-enforceable-days"]').prev().contains('Enter the maximum number of enforceable days')
      })
    })
  })

  describe('updating Mobility, disability or accessibility needs', () => {
    const sentReferral = sentReferralFactory.build()
    const stubCallsForUpdateReferralPage = () => {
      cy.stubUpdateSentReferralDetails(sentReferral.id, { referralId: sentReferral.id })
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubAmendAccessibilityNeeds(sentReferral.id, sentReferral)
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetIntervention(sentReferral.referral.interventionId, intervention.build())
      cy.stubAddInterventionNewUser()
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetRiskSummary(crn, riskSummary.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', ' Mobility, disability or accessibility needs ')
          .next()
          .next()
          .contains('Change')
          .click()
        cy.contains('For example, if they use a wheelchair, use a hearing aid or have a learning difficulty')
      })

      it('shows the existing accessibility details in the form', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-accessibility-needs`)
        cy.get('textarea[id="accessibility-needs"]').should('have.value', sentReferral.referral.accessibilityNeeds)
      })

      it('redirects to referral details on submission', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-accessibility-needs`)
        cy.get('textarea[id="accessibility-needs"]').clear()
        cy.get('textarea[id="accessibility-needs"]').type('hearing aid')
        cy.contains("What's the reason for changing the mobility, disability or accessibility needs?").type('reason')
        cy.contains('Save changes').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-accessibility-needs`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the reason for change is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-accessibility-needs`)
        cy.get('textarea[id="accessibility-needs"]').clear()
        cy.get('textarea[id="accessibility-needs"]').type('hearing aid')
        cy.contains("What's the reason for changing the mobility, disability or accessibility needs?").type('    ')
        cy.contains('Save changes').click()

        cy.contains('There is a problem').next().contains('A reason for changing the referral must be supplied')
        cy.contains("What's the reason for changing the mobility, disability or accessibility needs?")
          .next()
          .contains('A reason for changing the referral must be supplied')
      })

      it('shows a validation error if accessibility needs are not changed', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-accessibility-needs`)
        cy.contains("What's the reason for changing the mobility, disability or accessibility needs?").type(
          'No Changes'
        )

        cy.contains('Save changes').click()

        cy.get('.govuk-notification-banner')
          .last()
          .within(() => {
            cy.contains('Important')
            cy.contains('You have not made any changes to mobility, disability or accessibility needs.')
          })
      })
    })
  })

  describe('updating additional information needs', () => {
    const sentReferral = sentReferralFactory.build()
    const stubCallsForUpdateReferralPage = () => {
      cy.stubUpdateSentReferralDetails(sentReferral.id, { referralId: sentReferral.id })
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubAmendAdditionalInformation(sentReferral.id, sentReferral)
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetIntervention(sentReferral.referral.interventionId, intervention.build())
      cy.stubAddInterventionNewUser()
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetRiskSummary(crn, riskSummary.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', ' Identify needs ').next().next().contains('Change').click()
        cy.contains('For example, the additional information needs to be updated')
      })

      it('shows the existing additional information details in the form', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-additional-information`)
        cy.get('textarea[id="additional-information"]').should(
          'have.value',
          sentReferral.referral.additionalNeedsInformation
        )
      })

      it('redirects to referral details on submission', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-additional-information`)
        cy.get('textarea[id="additional-information"]').clear()
        cy.get('textarea[id="additional-information"]').type('Struggles being alone')
        cy.contains("What's the reason for changing the additional information?").type('reason')
        cy.contains('Save changes').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-additional-information`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the reason for change is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-additional-information`)
        cy.get('textarea[id="additional-information"]').clear()
        cy.get('textarea[id="additional-information"]').type('Struggles being alone')
        cy.contains("What's the reason for changing the additional information?")
        cy.contains('Save changes').click()
        cy.contains('There is a problem').next().contains('A reason for changing the referral must be supplied')
      })

      it('shows a validation error if additional information needs are not changed', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-additional-information`)
        cy.contains("What's the reason for changing the additional information?").type(
          'Alex is currently sleeping on her aunt’s sofa'
        )

        cy.contains('Save changes').click()

        cy.get('.govuk-notification-banner')
          .last()
          .within(() => {
            cy.contains('Important')
            cy.contains('You have not made any changes to additional information.')
          })
      })
    })
  })

  describe('updating desired outcomes', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build()

    const sentReferral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.convictionId,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        complexityLevels: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
          },
        ],
        desiredOutcomes: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          },
        ],
      },
    })

    const stubCallsForUpdateReferralPage = () => {
      cy.stubUpdateDesiredOutcomesForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubAddInterventionNewUser()
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the amend outcomes page when clicking the change link in the details page', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('Accommodation intervention')
          .parent()
          .parent()
          .children()
          .last()
          .children()
          .should('contain', 'Desired outcomes')
          .find('#change-link-3')
          .click()

        cy.location('pathname').should(
          'equal',
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )

        cy.contains('What are the desired outcomes for Accommodation?')
      })

      it('displays list with currently selected outcomes', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)

        cy.contains('Accommodation intervention')
          .parent()
          .parent()
          .children()
          .last()
          .children()
          .should('contain', 'Complexity level')
          .should('contain', 'Desired outcomes')
          .find('#change-link-3')
          .click()

        cy.location('pathname').should(
          'equal',
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )

        cy.contains('What are the desired outcomes for Accommodation?')

        cy.get('[data-cy=desired-outcomes]')
          .children()
          .first()
          .within(() => {
            cy.contains('All barriers, as identified in the Service user action plan')
            cy.get('input[type="checkbox"]').should('be.checked')
          })
        cy.get('[data-cy=desired-outcomes]')
          .children()
          .first()
          .next()
          .within(() => {
            cy.contains('Service user makes progress in obtaining accommodation')
            cy.get('input[type="checkbox"]').should('be.checked')
          })
        cy.get('[data-cy=desired-outcomes]')
          .children()
          .first()
          .next()
          .next()
          .within(() => {
            cy.contains('Service user is helped to secure social or supported housing')
            cy.get('input[type="checkbox"]').should('not.be.checked')
          })
        cy.get('[data-cy=desired-outcomes]')
          .children()
          .first()
          .next()
          .next()
          .next()
          .within(() => {
            cy.contains('Service user is helped to secure a tenancy')
            cy.get('input[type="checkbox"]').should('not.be.checked')
          })
      })

      it('redirects to referral details on submission', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )
        cy.contains('What are the desired outcomes for Accommodation?')

        cy.get('[data-cy=desired-outcomes]').within(() => {
          cy.get(':checkbox').last().check()
        })

        cy.contains('What is the reason for changing the desired outcomes?').type('Update Desired Outcomes')

        cy.contains('Save changes').click()

        cy.location('pathname').should('equal', `/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.location('search').should('equal', `?detailsUpdated=true`)
        cy.get('.govuk-notification-banner--success')
          .should('contain', 'Success')
          .should('contain', 'Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )
        cy.contains('What are the desired outcomes for Accommodation?')
        cy.contains('Back').click()
        cy.location('pathname').should('equal', `/probation-practitioner/referrals/${sentReferral.id}/details`)
      })

      it('takes you back to referral details when cancel link is clicked', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )
        cy.contains('What are the desired outcomes for Accommodation?')
        cy.get('[data-cy=cancel]').click()
        cy.location('pathname').should('equal', `/probation-practitioner/referrals/${sentReferral.id}/details`)
      })

      it('shows a validation error if the reason for change is not supplied', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )
        cy.contains('What are the desired outcomes for Accommodation?')

        cy.get('[data-cy=desired-outcomes]').within(() => {
          cy.get(':checkbox').last().check()
        })

        cy.contains('Save changes').click()

        cy.get('.govuk-error-summary').within(() => {
          cy.contains('There is a problem')
          cy.contains('A reason for changing the referral must be supplied')
        })
      })

      it('shows a validation error if a desired outcome is not selected', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )
        cy.contains('What are the desired outcomes for Accommodation?')

        cy.get('[data-cy=desired-outcomes]').within(() => {
          cy.get(':checkbox').uncheck()
        })
        cy.contains('What is the reason for changing the desired outcomes?').type('No Desired Outcomes')

        cy.contains('Save changes').click()

        cy.get('.govuk-error-summary').within(() => {
          cy.contains('There is a problem')
          cy.contains('Select desired outcomes')
        })
      })

      it('shows a validation error if desired outcomes are not changed', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )
        cy.contains('What are the desired outcomes for Accommodation?')

        cy.contains('What is the reason for changing the desired outcomes?').type('No Changes')

        cy.contains('Save changes').click()

        cy.get('.govuk-notification-banner')
          .last()
          .within(() => {
            cy.contains('Important')
            cy.contains('You have not made any changes to desired outcomes.')
          })
      })
    })
  })

  describe('updating complexity level', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build()

    const sentReferral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.convictionId,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        complexityLevels: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
          },
        ],
        desiredOutcomes: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          },
        ],
      },
    })

    const stubCallsForUpdateReferralPage = () => {
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubAmendComplexityLevelForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubAddInterventionNewUser()
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])

        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('Accommodation intervention')
          .parent()
          .parent()
          .children()
          .last()
          .children()
          .should('contain', 'Complexity level')
          .contains('Change')

        cy.contains('.govuk-summary-list__key', 'Complexity level').next().next().contains('Change').click()
        cy.contains(`What's the new complexity level for ${accommodationServiceCategory.name}?`)
      })

      it('redirects to referral details on submission', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/service-category/${accommodationServiceCategory.id}/update-complexity-level`
        )
        cy.contains(`What's the new complexity level for ${accommodationServiceCategory.name}?`)
        cy.contains('Medium complexity').click()
        cy.contains("What's the reason for changing the complexity level?").type('reason')
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/service-category/${accommodationServiceCategory.id}/update-complexity-level`
        )
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the reason for change is not supplied', () => {
        cy.login(
          `/probation-practitioner/referrals/${sentReferral.id}/service-category/${accommodationServiceCategory.id}/update-complexity-level`
        )
        cy.contains(`What's the reason for changing the complexity level?`).type('    ')
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('A reason for changing the referral must be supplied')
        cy.contains(`What's the reason for changing the complexity level?`)
      })
    })
  })

  describe('updating reason for referral', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build()

    const sentReferral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.convictionId,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        complexityLevels: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
          },
        ],
        desiredOutcomes: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          },
        ],
      },
    })

    const stubCallsForUpdateReferralPage = () => {
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubAmendComplexityLevelForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
      cy.stubUpdateSentReferralDetails(sentReferral.id, { referralId: sentReferral.id })
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubAddInterventionNewUser()
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', 'Reason for referral and referral details')
          .next()
          .next()
          .contains('Change')
          .click()
        cy.contains('Provide the reason for this referral and further information for the service provider')
      })

      it('shows the existing reason for referral in the form', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-reason-for-referral`)
        cy.get('textarea[name="amend-reason-for-referral"]').should(
          'have.value',
          sentReferral.referral.reasonForReferral
        )
      })

      it('redirects to referral details on submission', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-reason-for-referral`)
        cy.get('textarea[name="amend-reason-for-referral"]').type('some other reason')
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-reason-for-referral`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the number of days is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-reason-for-referral`)
        cy.get('textarea[name="amend-reason-for-referral"]').clear()
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('Enter reason for the referral and referral details')
        cy.get('textarea[name="amend-reason-for-referral"]')
          .prev()
          .contains('Enter reason for the referral and referral details')
      })
    })
  })

  describe('updating probation practitioner name', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build()

    const sentReferral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        ppName: 'Brendon Mccullum',
        interventionId: personalWellbeingIntervention.id,
        isReferralReleasingIn12Weeks: null,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.convictionId,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        complexityLevels: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
          },
        ],
        desiredOutcomes: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          },
        ],
      },
    })

    const stubCallsForUpdateReferralPage = () => {
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubAmendComplexityLevelForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
      cy.stubAmendProbationPractitionerName(sentReferral.id, { referralId: sentReferral.id })
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubAddInterventionNewUser()
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', 'Name').next().next().contains('Change').click()
        cy.contains('Update probation practitioner name')
      })

      it('redirects to referral details on submission', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-probation-practitioner-name`)
        cy.get('#amend-probation-practitioner-name').clear()
        cy.get('#amend-probation-practitioner-name').type('Michael Atherton')
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-probation-practitioner-name`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the ppName is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-probation-practitioner-name`)
        cy.get('#amend-probation-practitioner-name').clear()
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('Enter probation practitioner name')
        cy.get('#amend-probation-practitioner-name').prev().contains('Enter probation practitioner name')
      })
    })
  })

  describe('updating prison establishment', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build()

    const sentReferral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.convictionId,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        complexityLevels: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
          },
        ],
        desiredOutcomes: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          },
        ],
        personCustodyPrisonId: 'AYI',
      },
    })

    const stubCallsForUpdateReferralPage = () => {
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubAmendComplexityLevelForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
      cy.stubAmendPrisonEstablishment(sentReferral.id, { referralId: sentReferral.id })
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubAddInterventionNewUser()
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', 'Prison establishment').next().next().contains('Change').click()
        cy.contains(`Update Jenny Jones's prison establishment`)
      })

      it('redirects to referral details on submission', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-prison-establishment`)
        cy.get('#amend-prison-establishment').type('Brinsford (HMP & YOI)')
        cy.get('textarea[name="reason-for-change"]').type('some reason')
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-prison-establishment`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the number of days is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-prison-establishment`)
        cy.get('#amend-prison-establishment').type('Brinsford (HMP & YOI)')
        cy.get('textarea[name="reason-for-change"]').clear()
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('Enter a reason')
        cy.get('textarea[name="reason-for-change"]').prev().contains('Enter a reason')
      })
    })
  })

  describe('updating expected release date', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build()

    const sentReferral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.convictionId,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        complexityLevels: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
          },
        ],
        desiredOutcomes: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          },
        ],
        personCustodyPrisonId: 'AYI',
      },
    })

    const stubCallsForUpdateReferralPage = () => {
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubAmendComplexityLevelForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
      cy.stubAmendExpectedReleaseDate(sentReferral.id, { referralId: sentReferral.id })
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubAddInterventionNewUser()
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', 'Expected release date').next().next().contains('Change').click()
        cy.contains(`Update Jenny Jones's expected release date`)
      })

      it('redirects to referral details on submission', () => {
        const tomorrow = moment().add(3, 'days')
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-expected-release-date`)
        cy.get('[type="radio"]').check('confirm')
        cy.get('#amend-expected-release-date-day').clear()
        cy.get('#amend-expected-release-date-month').clear()
        cy.get('#amend-expected-release-date-year').clear()
        cy.contains('Day').type(tomorrow.format('DD'))
        cy.contains('Month').type(tomorrow.format('MM'))
        cy.contains('Year').type(tomorrow.format('YYYY'))
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-expected-release-date`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the number of days is not supplied', () => {
        const tomorrow = moment().add(3, 'days')
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-expected-release-date`)
        cy.get('[type="radio"]').check('confirm')
        cy.get('#amend-expected-release-date-day').clear()
        cy.contains('Month').type(tomorrow.format('MM'))
        cy.contains('Year').type(tomorrow.format('YYYY'))
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('Enter the expected release date')
        cy.get('#amend-expected-release-date').prev().contains('Enter the expected release date')
      })
    })
  })

  describe('updating expected release date not known reason', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build()

    const sentReferral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.convictionId,
        serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
        complexityLevels: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
          },
        ],
        desiredOutcomes: [
          {
            serviceCategoryId: accommodationServiceCategory.id,
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          {
            serviceCategoryId: socialInclusionServiceCategory.id,
            desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          },
        ],
        personCustodyPrisonId: 'AYI',
      },
    })

    const stubCallsForUpdateReferralPage = () => {
      cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubAmendComplexityLevelForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
      cy.stubAmendExpectedReleaseDate(sentReferral.id, { referralId: sentReferral.id })
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = ramDeliusUserFactory.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubAddInterventionNewUser()
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
      cy.stubGetConvictionByCrnAndId(crn, sentReferral.referral.relevantSentenceId, caseConvictionFactory.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
      cy.stubGetSecuredChildAgencies(secureChildAgency.build())
      cy.stubGetPrisonerDetails(crn, prisoner.build())
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('.govuk-summary-list__key', 'Expected release date').next().next().contains('Change').click()
        cy.contains(`Update Jenny Jones's expected release date`)
      })

      it('redirects to referral details on submission', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-expected-release-date`)
        cy.get('[type="radio"]').check('change')
        cy.get('textarea[name="amend-date-unknown-reason"]').type('some reason')
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details?detailsUpdated=true`
        )
        cy.contains('Success')
        cy.contains('Referral changes saved')
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-expected-release-date`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the number of days is not supplied', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/amend-expected-release-date`)
        cy.get('[type="radio"]').check('change')
        cy.get('textarea[name="amend-date-unknown-reason"]').clear()
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('Enter a reason')
        cy.get('textarea[name="amend-date-unknown-reason"]').prev().contains('Enter a reason')
      })
    })
  })
})
