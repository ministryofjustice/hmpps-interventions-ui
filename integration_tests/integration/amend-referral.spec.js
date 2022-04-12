import sentReferralFactory from '../../testutils/factories/sentReferral'
import deliusServiceUser from '../../testutils/factories/deliusServiceUser'

context('Amend a referral', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  describe('updating maximum enforceable days ', () => {
    const sentReferral = sentReferralFactory.build()

    describe('as a probation practitioner', () => {
      it('shows the existing number of days in the form', () => {
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())

        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.get('input[name="maximum-enforceable-days"]').should(
          'have.value',
          sentReferral.referral.maximumEnforceableDays.toString()
        )
      })

      it('redirects to referral details on submission', () => {
        cy.stubUpdateSentReferralDetails(sentReferral.id, { referralId: sentReferral.id })
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())

        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.contains('What is the reason for changing the maximum number of days?').type('reason')
        cy.contains('Save and continue').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('takes you back to referral details when back link is clicked', () => {
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())

        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.contains('Back').click()
        cy.url().should(
          'be.equal',
          `${Cypress.config('baseUrl')}/probation-practitioner/referrals/${sentReferral.id}/details`
        )
      })

      it('shows a validation error if the reason for change is not supplied', () => {
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())

        cy.login(`/probation-practitioner/referrals/${sentReferral.id}/update-maximum-enforceable-days`)
        cy.contains('What is the reason for changing the maximum number of days?').type('    ')
        cy.contains('Save and continue').click()

        cy.contains('There is a problem').next().contains('A reason for changing the referral must be supplied')
        cy.contains('What is the reason for changing the maximum number of days?')
          .next()
          .contains('A reason for changing the referral must be supplied')
      })

      it('shows a validation error if the number of days is not supplied', () => {
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser.build())

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
