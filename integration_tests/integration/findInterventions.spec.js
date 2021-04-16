import interventionFactory from '../../testutils/factories/intervention'
import pccRegionFactory from '../../testutils/factories/pccRegion'

context('Find an intervention', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it('Probation practitioner views a list of search results', () => {
    cy.stubGetSentReferrals([])
    cy.stubGetDraftReferralsForUser([])
    cy.login()

    const thinkingAndBehaviourInterventionId = '6bf9d895-0d61-4b99-af91-f343befbc9a3'

    const interventions = [
      {
        title: 'Better solutions (anger management)',
        categoryName: 'thinking and behaviour',
        id: thinkingAndBehaviourInterventionId,
      },
      {
        title: 'HELP (domestic violence for males)',
        categoryName: 'relationships',
        id: 'bf3eb0df-2ef4-4aa9-9d98-bb0078be5042',
      },
    ].map(params => {
      return interventionFactory.build({
        title: params.title,
        serviceCategory: { name: params.categoryName },
        id: params.id,
        serviceProvider: { name: 'Harmony Living' },
      })
    })

    cy.stubGetInterventions(interventions)

    const pccRegions = [pccRegionFactory.build({ name: 'Cheshire' }), pccRegionFactory.build({ name: 'Lancashire' })]
    cy.stubGetPccRegions(pccRegions)

    cy.visit('/find-interventions')

    cy.get('h1').contains('Find interventions')
    cy.contains('2 results found')

    cy.get('h2').contains('Better solutions (anger management)')
    cy.contains('Thinking and behaviour')
    cy.get('h2').contains('HELP (domestic violence for males)')
    cy.contains('Relationships')

    cy.get('label[for*="gender"]').contains('Male').click()
    cy.get('label[for*="age"]').contains('Only for ages 18 to 25').click()
    cy.get('label[for*="pcc-region-ids"]').contains('Cheshire').click()

    cy.contains('Filter results').click()

    const selectedIntervention = interventions.find(
      intervention => intervention.id === thinkingAndBehaviourInterventionId
    )
    cy.stubGetIntervention(thinkingAndBehaviourInterventionId, selectedIntervention)

    cy.contains('Better solutions (anger management)').click()

    cy.location('pathname').should('equal', `/find-interventions/intervention/${thinkingAndBehaviourInterventionId}`)

    cy.get('h1').contains('Better solutions (anger management)')
    cy.contains('Thinking and behaviour')

    cy.get('#service-provider-tab').contains('Harmony Living')
  })
})
