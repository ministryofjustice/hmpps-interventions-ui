import sentReferralFactory from '../../testutils/factories/sentReferral'
import deliusServiceUser from '../../testutils/factories/deliusServiceUser'
import intervention from '../../testutils/factories/intervention'
import deliusUser from '../../testutils/factories/deliusUser'
import deliusConviction from '../../testutils/factories/deliusConviction'
import supplementaryRiskInformation from '../../testutils/factories/supplementaryRiskInformation'
import riskSummary from '../../testutils/factories/riskSummary'
import deliusOffenderManager from '../../testutils/factories/deliusOffenderManager'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'

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
      cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = deliusUser.build()

      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetIntervention(sentReferral.referral.interventionId, intervention.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetExpandedServiceUserByCRN(crn, deliusServiceUser.build())
      cy.stubGetConvictionById(crn, sentReferral.referral.relevantSentenceId, deliusConviction.build())
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetRiskSummary(crn, riskSummary.build())
      cy.stubGetResponsibleOfficerForServiceUser(crn, [deliusOffenderManager.build()])
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
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

  describe('updating desired outcomes', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const personalWellbeingIntervention = intervention.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = deliusConviction.build({
      offences: [
        {
          mainOffence: true,
          detail: {
            mainCategoryDescription: 'Burglary',
            subCategoryDescription: 'Theft act, 1968',
          },
        },
      ],
      sentence: {
        expectedSentenceEndDate: '2025-11-15',
      },
    })

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
      cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = deliusUser.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetServiceUserByCRN(crn, deliusServiceUser)
      cy.stubGetExpandedServiceUserByCRN(crn, deliusServiceUser.build())
      cy.stubGetConvictionById(crn, sentReferral.referral.relevantSentenceId, deliusConviction.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficerForServiceUser(crn, [deliusOffenderManager.build()])
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the amend outcomes page when clicking the change link in the details page', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('Accommodation service')
          .next()
          .children()
          .last()
          .should('contain', 'Desired outcomes')
          .contains('Change')
          .click()

        cy.location('pathname').should(
          'equal',
          `/probation-practitioner/referrals/${sentReferral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
        )

        cy.contains('What are the desired outcomes for Accommodation?')
      })

      it('displays list with currently selected outcomes', () => {
        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)

        cy.contains('Accommodation service')
          .next()
          .children()
          .first()
          .should('contain', 'Complexity level')
          .next()
          .should('contain', 'Desired outcomes')
          .contains('Change')
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
          .next()
          .within(() => {
            cy.contains('Service user makes progress in obtaining accommodation')
            cy.get('input[type="checkbox"]').should('be.checked')
          })
          .next()
          .within(() => {
            cy.contains('Service user is helped to secure social or supported housing')
            cy.get('input[type="checkbox"]').should('not.be.checked')
          })
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

        cy.get('.govuk-notification-banner').within(() => {
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

    const conviction = deliusConviction.build({
      offences: [
        {
          mainOffence: true,
          detail: {
            mainCategoryDescription: 'Burglary',
            subCategoryDescription: 'Theft act, 1968',
          },
        },
      ],
      sentence: {
        expectedSentenceEndDate: '2025-11-15',
      },
    })

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
      cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())
      cy.stubAmendComplexityLevelForServiceCategory(sentReferral.id, accommodationServiceCategory.id, sentReferral)
    }
    const stubCallsForReferralDetailsPage = () => {
      const { crn } = sentReferral.referral.serviceUser
      const pp = deliusUser.build()

      cy.stubGetIntervention(sentReferral.referral.interventionId, personalWellbeingIntervention)
      cy.stubGetSentReferral(sentReferral.id, sentReferral)
      cy.stubGetServiceUserByCRN(crn, deliusServiceUser)
      cy.stubGetExpandedServiceUserByCRN(crn, deliusServiceUser.build())
      cy.stubGetConvictionById(crn, sentReferral.referral.relevantSentenceId, deliusConviction.build())
      cy.stubGetUserByUsername(pp.username, pp)
      cy.stubGetSupplementaryRiskInformation(sentReferral.supplementaryRiskId, supplementaryRiskInformation.build())
      cy.stubGetResponsibleOfficerForServiceUser(crn, [deliusOffenderManager.build()])
      cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])

        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        cy.contains('Accommodation service')
          .next()
          .children()
          .should('contain', 'Complexity level')
          .contains('Change')
          .click()
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
})
