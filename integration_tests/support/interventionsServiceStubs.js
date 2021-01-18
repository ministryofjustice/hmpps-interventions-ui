Cypress.Commands.add('stubGetDraftReferral', (id, responseJson) => {
  cy.task('stubFor', {
    request: {
      method: 'GET',
      urlPattern: `/interventions/draft-referral/${id}`,
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

Cypress.Commands.add('stubCreateDraftReferral', responseJson => {
  cy.task('stubFor', {
    request: {
      method: 'POST',
      urlPattern: '/interventions/draft-referral',
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        Location: `http://localhost:8092/interventions/draft-referral/${responseJson.id}`,
      },
      jsonBody: responseJson,
    },
  })
})

Cypress.Commands.add('stubPatchDraftReferral', (id, responseJson) => {
  cy.task('stubFor', {
    request: {
      method: 'PATCH',
      urlPattern: `/interventions/draft-referral/${id}`,
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

Cypress.Commands.add('stubGetServiceCategory', (id, responseJson) => {
  cy.task('stubFor', {
    request: {
      method: 'GET',
      urlPattern: `/interventions/service-category/${id}`,
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

Cypress.Commands.add('stubGetDraftReferralsForUser', responseJson => {
  cy.task('stubFor', {
    request: {
      method: 'GET',
      urlPath: '/interventions/draft-referrals',
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

Cypress.Commands.add('stubGetServiceProvider', (id, responseJson) => {
  cy.task('stubFor', {
    request: {
      method: 'GET',
      urlPattern: `/interventions/service-provider/${id}`,
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

Cypress.Commands.add('stubSendDraftReferral', (id, responseJson) => {
  cy.task('stubFor', {
    request: {
      method: 'POST',
      urlPattern: `/interventions/draft-referral/${id}/send`,
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

Cypress.Commands.add('stubGetSentReferral', (id, responseJson) => {
  cy.task('stubFor', {
    request: {
      method: 'GET',
      urlPattern: `/interventions/sent-referral/${id}`,
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
