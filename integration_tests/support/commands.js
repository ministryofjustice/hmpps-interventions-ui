import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusConvictionFactory from '../../testutils/factories/deliusConviction'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import deliusOffenderManagerFactory from '../../testutils/factories/deliusOffenderManager'

Cypress.Commands.add('login', () => {
  cy.request(`/`)
  cy.task('getLoginUrl').then(cy.visit)
})

Cypress.Commands.add('stubGetAuthUserByEmailAddress', responseJson => {
  cy.task('stubGetAuthUserByEmailAddress', { responseJson })
})

Cypress.Commands.add('stubGetAuthUserByUsername', (username, responseJson) => {
  cy.task('stubGetAuthUserByUsername', { username, responseJson })
})

Cypress.Commands.add('withinFieldsetThatContains', (text, action) => {
  cy.contains(text).parent('fieldset').within(action)
})

Cypress.Commands.add('stubViewReferralDetails', referralToView => {
  const deliusUser = deliusUserFactory.build()
  const conviction = deliusConvictionFactory.build({
    convictionId: referralToView.referral.relevantSentenceId,
  })
  cy.stubGetSentReferral(referralToView.id, referralToView)
  cy.stubGetExpandedServiceUserByCRN(referralToView.referral.serviceUser.crn, expandedDeliusServiceUserFactory.build())
  cy.stubGetConvictionById(referralToView.referral.serviceUser.crn, conviction.convictionId, conviction)
  cy.stubGetUserByUsername(deliusUser.username, deliusUser)
  cy.stubGetSupplementaryRiskInformation(
    referralToView.supplementaryRiskId,
    supplementaryRiskInformationFactory.build()
  )
  cy.stubGetResponsibleOfficerForServiceUser(referralToView.referral.serviceUser.crn, [
    deliusOffenderManagerFactory.build(),
  ])
})

const getTable = (subject, options = {}) => {
  if (subject.get().length > 1) {
    throw new Error(`Selector "${subject.selector}" returned more than 1 element.`)
  }

  const tableElement = subject.get()[0]
  const headers = [...tableElement.querySelectorAll('thead th')].map(e => e.textContent)

  const rows = [...tableElement.querySelectorAll('tbody tr')].map(row => {
    return [...row.querySelectorAll('td')].map(e => e.textContent.trim())
  })

  return rows.map(row =>
    row.reduce((acc, curr, index) => {
      if (options.onlyColumns && !options.onlyColumns.includes(headers[index])) {
        return { ...acc }
      }
      return { ...acc, [headers[index]]: curr }
    }, {})
  )
}

Cypress.Commands.add('getTable', { prevSubject: true }, getTable)
