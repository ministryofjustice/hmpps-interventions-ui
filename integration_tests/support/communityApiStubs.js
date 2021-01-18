Cypress.Commands.add('stubGetServiceUserByCRN', (crn, responseJson) => {
  cy.task('stubFor', {
    request: {
      method: 'GET',
      urlPattern: `/community-api/secure/offenders/crn/${crn}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: responseJson,
    },
  })
})
