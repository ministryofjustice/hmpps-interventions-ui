import interventionFactory from '../../testutils/factories/intervention'
import pccRegionFactory from '../../testutils/factories/pccRegion'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import pageFactory from '../../testutils/factories/page'

context('Find an intervention', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')

    cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
    cy.stubGetDraftReferralsForUserToken([])
    cy.stubAddInterventionNewUser()
    cy.login()
  })

  it('Probation practitioner clicks the find interventions tab', () => {
    cy.visit('/probation-practitioner/find')

    cy.get('[data-cy=download-interventions-header]').contains('Download structured interventions')

    cy.get('[data-cy=download-interventions-content]').contains(
      'You can download information about structured interventions. You cannot use this service to search for (or refer) to these interventions. This list was updated in April 2022.'
    )
    cy.get('[data-cy=find-interventions-button]').contains('Find interventions')
  })

  it('Probation practitioner views a list of search results', () => {
    const thinkingAndBehaviourInterventionId = '6bf9d895-0d61-4b99-af91-f343befbc9a3'

    const interventions = [
      {
        title: 'Better solutions (anger management)',
        categoryNames: ['thinking and behaviour'],
        id: thinkingAndBehaviourInterventionId,
      },
      {
        title: 'HELP (domestic violence for males)',
        categoryNames: ['relationships', 'emotional wellbeing'],
        id: 'bf3eb0df-2ef4-4aa9-9d98-bb0078be5042',
      },
    ].map(params => {
      return interventionFactory.build({
        title: params.title,
        serviceCategories: params.categoryNames.map(name => serviceCategoryFactory.build({ name })),
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

    // check if the page is accessible from the CRS homepage
    cy.visit('/crs-homepage')
    cy.contains('a', 'Find a CRS intervention and make a referral').click()

    cy.get('h1').contains('Find interventions')
    cy.contains('2 results found')
  })
})
