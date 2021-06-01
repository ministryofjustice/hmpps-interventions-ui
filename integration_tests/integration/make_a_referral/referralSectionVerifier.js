// eslint-disable-next-line max-classes-per-file
export default class ReferralSectionVerifier {
  static get verifySection() {
    return new _ReferralSectionChecker()
  }
}
function hrefAttrChainer(isActive) {
  return isActive ? 'have.attr' : 'not.have.attr'
}
class _ReferralSectionChecker {
  reviewServiceUserInformation(activeLinks) {
    cy.get('[data-cy=url]')
      .contains('Confirm service user’s personal details')
      .should(hrefAttrChainer(activeLinks.confirmServiceUserDetails), 'href')
    cy.get('[data-cy=url]')
      .contains('Service user’s risk information')
      .should(hrefAttrChainer(activeLinks.riskInformation), 'href')
    cy.get('[data-cy=url]')
      .contains('Service user’s needs and requirements')
      .should(hrefAttrChainer(activeLinks.needsAndRequirements), 'href')
    return this
  }

  interventionReferralDetails(activeLinks) {
    cy.get('[data-cy=url]')
      .contains('Confirm the relevant sentence for the accommodation referral')
      .should(hrefAttrChainer(activeLinks.relevantSentence), 'href')
    cy.get('[data-cy=url]')
      .contains('Select required complexity level')
      .should(hrefAttrChainer(activeLinks.requiredComplexityLevel), 'href')
    cy.get('[data-cy=url]')
      .contains('Select desired outcomes')
      .should(hrefAttrChainer(activeLinks.desiredOutcomes), 'href')
    cy.get('[data-cy=url]')
      .contains('Enter when the accommodation service need to be completed')
      .should(hrefAttrChainer(activeLinks.completedDate), 'href')
    cy.get('[data-cy=url]').contains('Enter enforceable days used').should(hrefAttrChainer(activeLinks.rarDays), 'href')
    cy.get('[data-cy=url]')
      .contains('Further information for service provider')
      .should(hrefAttrChainer(activeLinks.furtherInformation), 'href')
    return this
  }

  selectServiceCagories(activeLinks) {
    cy.get("[data-cy=url]:contains('Select service categories for the Womans Service referral')").should(
      hrefAttrChainer(activeLinks.selectServiceCategories),
      'href'
    )
    return this
  }

  cohortInterventionReferralDetails(activeLinks) {
    cy.get("[data-cy=url]:contains('Confirm the relevant sentence for the Womans Service referral')").should(
      hrefAttrChainer(activeLinks.relevantSentence),
      'href'
    )
    cy.get("[data-cy=url]:contains('Select required complexity level')")
      .eq(0)
      .should(hrefAttrChainer(activeLinks.requiredComplexityLevel1), 'href')
    cy.get("[data-cy=url]:contains('Select desired outcomes')")
      .eq(0)
      .should(hrefAttrChainer(activeLinks.desiredOutcomes1), 'href')
    cy.get("[data-cy=url]:contains('Select required complexity level')")
      .eq(1)
      .should(hrefAttrChainer(activeLinks.requiredComplexityLevel2), 'href')
    cy.get("[data-cy=url]:contains('Select desired outcomes')")
      .eq(1)
      .should(hrefAttrChainer(activeLinks.desiredOutcomes1), 'href')
    cy.get('[data-cy=url]')
      .contains('Enter when the Womans Service referral need to be completed')
      .should(hrefAttrChainer(activeLinks.completedDate), 'href')
    cy.get('[data-cy=url]').contains('Enter enforceable days used').should(hrefAttrChainer(activeLinks.rarDays), 'href')
    cy.get('[data-cy=url]')
      .contains('Further information for service provider')
      .should(hrefAttrChainer(activeLinks.furtherInformation), 'href')
    return this
  }

  checkYourAnswers(activeLinks) {
    cy.get('[data-cy=url]').contains('Check your answers').should(hrefAttrChainer(activeLinks.checkAnswers), 'href')
    return this
  }
}
