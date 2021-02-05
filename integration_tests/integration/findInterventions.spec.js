import interventionFactory from '../../testutils/factories/intervention'

context('Find an intervention', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it('Probation practitioner views a list of search results', () => {
    cy.stubGetDraftReferralsForUser([])
    cy.login()

    const interventions = [
      { title: 'Better solutions (anger management)', categoryName: 'thinking and behaviour' },
      { title: 'HELP (domestic violence for males)', categoryName: 'relationships' },
    ].map(params => {
      return interventionFactory.build({ title: params.title, serviceCategory: { name: params.categoryName } })
    })
    cy.stubGetInterventions(interventions)

    cy.visit('/find-interventions')

    cy.get('h1').contains('Find interventions')
    cy.contains('2 results found')

    cy.get('h2').contains('Better solutions (anger management)')
    cy.contains('Thinking and behaviour')
    cy.get('h2').contains('HELP (domestic violence for males)')
    cy.contains('Relationships')
  })
})
