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

Cypress.Commands.add('stubGetActionPlan', (id, responseJson) => {
  cy.task('stubGetActionPlan', { id, responseJson })
})

Cypress.Commands.add('stubCreateDraftActionPlan', responseJson => {
  cy.task('stubCreateDraftActionPlan', { responseJson })
})

Cypress.Commands.add('stubUpdateDraftActionPlan', (id, responseJson) => {
  cy.task('stubUpdateDraftActionPlan', { id, responseJson })
})

Cypress.Commands.add('withinFieldsetThatContains', (text, action) => {
  cy.contains(text).parent('fieldset').within(action)
})

const getTable = (subject, options = {}) => {
  if (subject.get().length > 1) {
    throw new Error(`Selector "${subject.selector}" returned more than 1 element.`)
  }

  const tableElement = subject.get()[0]
  const headers = [...tableElement.querySelectorAll('thead th')].map(e => e.textContent)

  const rows = [...tableElement.querySelectorAll('tbody tr')].map(row => {
    return [...row.querySelectorAll('td')].map(e => e.textContent)
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
