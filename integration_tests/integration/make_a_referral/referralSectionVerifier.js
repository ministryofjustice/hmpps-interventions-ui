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
  reviewPPDetails(activeLinks) {
    cy.get('[data-cy=url]')
      .contains('Name,email address and location')
      .should(hrefAttrChainer(activeLinks.ppDetails), 'href')
    cy.get('[data-cy=url]')
      .contains('Name,email address and location')
      .next()
      .contains(activeLinks.ppDetailsStatus, { matchCase: false })
    return this
  }

  reviewCurrentLocationAndExpectedReleaseDate(activeLinks) {
    cy.get('[data-cy=url]').contains('Establishment').should(hrefAttrChainer(activeLinks.establishment), 'href')
    cy.get('[data-cy=url]')
      .contains('Establishment')
      .next()
      .contains(activeLinks.establishmentStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Expected release date')
      .should(hrefAttrChainer(activeLinks.expectedReleaseDate), 'href')

    cy.get('[data-cy=url]')
      .contains('Expected release date')
      .next()
      .contains(activeLinks.expectedReleaseDateStatus, { matchCase: false })
    return this
  }

  reviewCurrentLocation(activeLinks) {
    cy.get('[data-cy=url]').contains('Establishment').should(hrefAttrChainer(activeLinks.establishment), 'href')
    cy.get('[data-cy=url]')
      .contains('Establishment')
      .next()
      .contains(activeLinks.establishmentStatus, { matchCase: false })
    return this
  }

  reviewServiceUserInformation(activeLinks) {
    cy.get('[data-cy=url]')
      .contains('Personal details')
      .should(hrefAttrChainer(activeLinks.confirmServiceUserDetails), 'href')
    cy.get('[data-cy=url]')
      .contains('Personal details')
      .next()
      .contains(activeLinks.confirmServiceUserDetailsStatus, { matchCase: false })

    cy.get('[data-cy=url]').contains('Risk information').should(hrefAttrChainer(activeLinks.riskInformation), 'href')
    cy.get('[data-cy=url]')
      .contains('Risk information')
      .next()
      .contains(activeLinks.riskInformationStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Needs and requirements')
      .should(hrefAttrChainer(activeLinks.needsAndRequirements), 'href')
    cy.get('[data-cy=url]')
      .contains('Needs and requirements')
      .next()
      .contains(activeLinks.needsAndRequirementsStatus, { matchCase: false })

    return this
  }

  interventionReferralDetails(activeLinks) {
    cy.get('[data-cy=url]')
      .contains('Confirm the relevant sentence for the Accommodation referral')
      .should(hrefAttrChainer(activeLinks.relevantSentence), 'href')
    cy.get('[data-cy=url]')
      .contains('Confirm the relevant sentence for the Accommodation referral')
      .next()
      .contains(activeLinks.relevantSentenceStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Select required complexity level')
      .should(hrefAttrChainer(activeLinks.requiredComplexityLevel), 'href')
    cy.get('[data-cy=url]')
      .contains('Select required complexity level')
      .next()
      .contains(activeLinks.requiredComplexityLevelStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Select desired outcomes')
      .should(hrefAttrChainer(activeLinks.desiredOutcomes), 'href')
    cy.get('[data-cy=url]')
      .contains('Select desired outcomes')
      .next()
      .contains(activeLinks.desiredOutcomesStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Enter when the Accommodation service needs to be completed')
      .should(hrefAttrChainer(activeLinks.completedDate), 'href')
    cy.get('[data-cy=url]')
      .contains('Enter when the Accommodation service needs to be completed')
      .next()
      .contains(activeLinks.completedDateStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Enter enforceable days used')
      .should(hrefAttrChainer(activeLinks.enforceableDays), 'href')
    cy.get('[data-cy=url]')
      .contains('Enter enforceable days used')
      .next()
      .contains(activeLinks.enforceableDaysStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Further information for service provider')
      .should(hrefAttrChainer(activeLinks.furtherInformation), 'href')
    cy.get('[data-cy=url]')
      .contains('Further information for service provider')
      .next()
      .contains(activeLinks.furtherInformationStatus, { matchCase: false })

    return this
  }

  selectServiceCategories(activeLinks) {
    cy.get(`[data-cy=url]:contains("Select service types for the Women's services referral")`).should(
      hrefAttrChainer(activeLinks.selectServiceCategories),
      'href'
    )
    cy.get(`[data-cy=url]:contains("Select service types for the Women's services referral")`)
      .next()
      .contains(activeLinks.selectServiceCategoriesStatus, { matchCase: false })

    return this
  }

  disabledCohortInterventionReferralDetails() {
    cy.get(`[data-cy=url]:contains("Details of this part will depend on the services you choose")`).should(
      'not.have.attr',
      'href'
    )
    cy.get(`[data-cy=url]:contains("Details of this part will depend on the services you choose")`)
      .next()
      .contains('CANNOT START YET', { matchCase: false })
    return this
  }

  cohortInterventionReferralDetails(activeLinks) {
    cy.get(`[data-cy=url]:contains("Confirm the relevant sentence for the Women's services referral")`).should(
      hrefAttrChainer(activeLinks.relevantSentence),
      'href'
    )
    cy.get(`[data-cy=url]:contains("Confirm the relevant sentence for the Women's services referral")`)
      .next()
      .contains(activeLinks.relevantSentenceStatus, { matchCase: false })

    cy.get("[data-cy=url]:contains('Select required complexity level')")
      .eq(0)
      .should(hrefAttrChainer(activeLinks.requiredComplexityLevel1), 'href')
    cy.get("[data-cy=url]:contains('Select required complexity level')")
      .eq(0)
      .next()
      .contains(activeLinks.requiredComplexityLevel1Status, { matchCase: false })

    cy.get("[data-cy=url]:contains('Select desired outcomes')")
      .eq(0)
      .should(hrefAttrChainer(activeLinks.desiredOutcomes1), 'href')
    cy.get("[data-cy=url]:contains('Select desired outcomes')")
      .eq(0)
      .next()
      .contains(activeLinks.desiredOutcomes1Status, { matchCase: false })

    cy.get("[data-cy=url]:contains('Select required complexity level')")
      .eq(1)
      .should(hrefAttrChainer(activeLinks.requiredComplexityLevel2), 'href')
    cy.get("[data-cy=url]:contains('Select required complexity level')")
      .eq(1)
      .next()
      .contains(activeLinks.requiredComplexityLevel2Status, { matchCase: false })

    cy.get("[data-cy=url]:contains('Select desired outcomes')")
      .eq(1)
      .should(hrefAttrChainer(activeLinks.desiredOutcomes2), 'href')
    cy.get("[data-cy=url]:contains('Select desired outcomes')")
      .eq(1)
      .next()
      .contains(activeLinks.desiredOutcomes2Status, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains("Enter when the Women's services referral needs to be completed")
      .should(hrefAttrChainer(activeLinks.completedDate), 'href')
    cy.get('[data-cy=url]')
      .contains("Enter when the Women's services referral needs to be completed")
      .next()
      .contains(activeLinks.completedDateStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Enter enforceable days used')
      .should(hrefAttrChainer(activeLinks.enforceableDays), 'href')
    cy.get('[data-cy=url]')
      .contains('Enter enforceable days used')
      .next()
      .contains(activeLinks.enforceableDaysStatus, { matchCase: false })

    cy.get('[data-cy=url]')
      .contains('Further information for service provider')
      .should(hrefAttrChainer(activeLinks.furtherInformation), 'href')
    cy.get('[data-cy=url]')
      .contains('Further information for service provider')
      .next()
      .contains(activeLinks.furtherInformationStatus, { matchCase: false })
    return this
  }

  checkAllReferralInformation(activeLinks) {
    cy.get('[data-cy=url]')
      .contains('Check referral information')
      .should(hrefAttrChainer(activeLinks.checkAllReferralInformation), 'href')
    cy.get('[data-cy=url]')
      .contains('Check referral information')
      .next()
      .contains(activeLinks.checkAllReferralInformationStatus, { matchCase: false })
    return this
  }
}
