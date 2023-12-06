import sentReferralFactory from '../../testutils/factories/sentReferral'
import interventionFactory from '../../testutils/factories/intervention'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import caseNoteFactory from '../../testutils/factories/caseNote'
import pageFactory from '../../testutils/factories/page'

context('Case notes', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  describe('when viewing case notes for a referral', () => {
    describe('when there is a case note made by a PP', () => {
      it('should display "Probation Practitioner" as the user type', () => {
        cy.task('stubServiceProviderToken')
        cy.task('stubServiceProviderAuthUser')
        const sentReferral = sentReferralFactory.build()
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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
        cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
        cy.stubGetCaseNotes(sentReferral.id, pageFactory.build({ content: [ppCaseNote] }))
        cy.visit(`/service-provider/referrals/${sentReferral.id}/case-notes`)

        cy.get('table')
          .getTable()
          .should(tableData => {
            expect(tableData[0].Details).to.contain('probation practitioner')
          })
      })
    })

    describe('when there is a case note made by a SP', () => {
      it('should display "Service Provider" as the user type', () => {
        cy.task('stubServiceProviderToken')
        cy.task('stubServiceProviderAuthUser')
        const sentReferral = sentReferralFactory.build()
        cy.stubGetSentReferralsForUserToken([])
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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
        cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
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

  describe('when adding a case note for a referral', () => {
    describe('as a PP', () => {
      it('should not display the option to choose whether or not to send an email', () => {
        cy.task('stubProbationPractitionerToken')
        cy.task('stubProbationPractitionerAuthUser')

        const sentReferral = sentReferralFactory.build()
        cy.stubGetSentReferralsForUserToken([])
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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
        cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
        cy.stubGetCaseNotes(sentReferral.id, pageFactory.build({ content: [ppCaseNote] }))
        cy.visit(`/probation-practitioner/referrals/${sentReferral.id}/case-notes`)
        cy.contains('Add case note').click()
        cy.get('#send-case-note-email').should('not.exist')
      })
    })

    describe('as an SP', () => {
      it('should display the option to choose whether or not to send an email', () => {
        cy.task('stubServiceProviderToken')
        cy.task('stubServiceProviderAuthUser')

        const sentReferral = sentReferralFactory.build()
        cy.stubGetSentReferralsForUserToken([])
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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
        cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
        cy.stubGetCaseNotes(sentReferral.id, pageFactory.build({ content: [ppCaseNote] }))
        cy.visit(`/service-provider/referrals/${sentReferral.id}/case-notes`)
        cy.contains('Add case note').click()
        cy.contains('Would you like the probation practitioner to get an email about this case note?')
        cy.get('#send-case-note-email').should('exist')
      })
    })
  })
})
