import sentReferralFactory from '../../testutils/factories/sentReferral'
import interventionFactory from '../../testutils/factories/intervention'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import caseNoteFactory from '../../testutils/factories/caseNote'
import pageFactory from '../../testutils/factories/page'

context('Case notes', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  describe('when viewing case notes for a referral', () => {
    describe('when there is a case note made by a PP', () => {
      it('should display "Probation Practitioner" as the user type', () => {
        const sentReferral = sentReferralFactory.build()
        cy.stubGetSentReferralsForUserToken([])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.login()

        const ppCaseNote = caseNoteFactory.build({
          sentBy: {
            username: 'BERNARD.BEAKS',
            userId: 'userId',
            authSource: 'delius',
          },
        })

        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetIntervention(sentReferral.referral.interventionId, interventionFactory.build())
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
        cy.stubGetCaseNotes(sentReferral.id, pageFactory.build({ content: [ppCaseNote] }))
        cy.visit(`/service-provider/referrals/${sentReferral.id}/case-notes`)

        cy.get('table')
          .getTable()
          .should(tableData => {
            expect(tableData[0].Details).to.contain('probation practitioner')
          })
      })
    })

    describe('when there is a case note made by a PP', () => {
      it('should display "Service Provider" as the user type', () => {
        const sentReferral = sentReferralFactory.build()
        cy.stubGetSentReferralsForUserToken([])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.login()

        const ppCaseNote = caseNoteFactory.build({
          sentBy: {
            username: 'BERNARD.BEAKS',
            userId: 'userId',
            authSource: 'auth',
          },
        })

        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetIntervention(sentReferral.referral.interventionId, interventionFactory.build())
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
        cy.stubGetCaseNotes(sentReferral.id, pageFactory.build({ content: [ppCaseNote] }))
        cy.visit(`/service-provider/referrals/${sentReferral.id}/case-notes`)

        cy.get('table')
          .getTable()
          .should(tableData => {
            expect(tableData[0].Details).to.contain('service provider')
          })
      })
    })
  })
})
