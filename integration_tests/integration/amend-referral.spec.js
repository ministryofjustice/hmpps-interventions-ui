import sentReferralFactory from '../../testutils/factories/sentReferral'
import deliusServiceUser from '../../testutils/factories/deliusServiceUser'
import intervention from '../../testutils/factories/intervention'
import deliusUser from '../../testutils/factories/deliusUser'
import deliusConviction from '../../testutils/factories/deliusConviction'
import supplementaryRiskInformation from '../../testutils/factories/supplementaryRiskInformation'
import riskSummary from '../../testutils/factories/riskSummary'
import deliusOffenderManager from '../../testutils/factories/deliusOffenderManager'

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
    }

    describe('as a probation practitioner', () => {
      beforeEach(() => {
        stubCallsForReferralDetailsPage()
        stubCallsForUpdateReferralPage()
      })

      it('takes the pp to the form when clicking the change link in the details page', () => {
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
})
