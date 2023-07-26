import ramDeliusUserFactory from '../../testutils/factories/ramDeliusUser'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import deliusResponsibleOfficerFactory from '../../testutils/factories/deliusResponsibleOfficer'
import caseConvictionFactory from '../../testutils/factories/caseConviction'

Cypress.Commands.add('login', (redirectUrl = '/') => {
  cy.request(redirectUrl)
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
  const deliusUser = ramDeliusUserFactory.build()
  const conviction = caseConvictionFactory.build({
    conviction: {
      id: referralToView.referral.relevantSentenceId,
    },
  })
  cy.stubGetSentReferral(referralToView.id, referralToView)
  cy.stubGetConvictionByCrnAndId(referralToView.referral.serviceUser.crn, conviction.convictionId, conviction)
  cy.stubGetUserByUsername(deliusUser.username, deliusUser)
  cy.stubGetSupplementaryRiskInformation(
    referralToView.supplementaryRiskId,
    supplementaryRiskInformationFactory.build()
  )
  cy.stubGetResponsibleOfficer(referralToView.referral.serviceUser.crn, [deliusResponsibleOfficerFactory.build()])
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
