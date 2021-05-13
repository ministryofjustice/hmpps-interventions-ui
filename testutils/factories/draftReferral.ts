import { Factory } from 'fishery'
import DraftReferral from '../../server/models/draftReferral'
import serviceCategoryFactory from './serviceCategory'
import interventionFactory from './intervention'

class DraftReferralFactory extends Factory<DraftReferral> {
  justCreated() {
    return this
  }

  createdAt(date: Date) {
    return this.params({ createdAt: date.toISOString() })
  }

  serviceCategorySelected(serviceCategoryId?: string) {
    const resolvedServiceCategoryId = serviceCategoryId ?? serviceCategoryFactory.build().id
    return this.params({ serviceCategoryId: resolvedServiceCategoryId })
  }

  serviceCategoriesSelected(serviceCategoryIds?: string[]) {
    const resolvedServiceCategoryIds =
      serviceCategoryIds ?? serviceCategoryFactory.buildList(3).map(category => category.id)

    return this.params({ serviceCategoryIds: resolvedServiceCategoryIds })
  }

  completionDeadlineSet() {
    return this.params({ completionDeadline: '2021-08-24' })
  }

  serviceUserDetailsSet() {
    return this.serviceUserSelected().riskInformation().needsAndRequirements()
  }

  serviceUserSelected() {
    return this.params({
      serviceUser: {
        crn: 'X123456',
        title: 'Mr',
        firstName: 'Alex',
        lastName: 'River',
        dateOfBirth: '1980-01-01',
        gender: 'Male',
        ethnicity: 'British',
        preferredLanguage: 'English',
        religionOrBelief: 'Agnostic',
        disabilities: ['Autism spectrum condition', 'sciatica'],
      },
    })
  }

  riskInformation() {
    return this.params({
      additionalRiskInformation: '',
    })
  }

  needsAndRequirements() {
    return this.params({
      additionalNeedsInformation: '',
      accessibilityNeeds: '',
      needsInterpreter: false,
      hasAdditionalResponsibilities: false,
    })
  }

  relevantSentence() {
    return this.params({
      relevantSentenceId: 123456789,
    })
  }

  desiredOutcomes() {
    return this.params({
      desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
    })
  }

  complexityLevel() {
    return this.params({
      complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
    })
  }

  completionDate() {
    return this.params({
      completionDeadline: '2021-08-24',
    })
  }

  rarDays() {
    return this.params({
      usingRarDays: false,
    })
  }

  furtherInformation() {
    return this.params({
      furtherInformation: '',
    })
  }
}

export default DraftReferralFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  createdAt: new Date(Date.now()).toISOString(),
  serviceUser: {
    crn: 'X123456',
    title: null,
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    gender: null,
    ethnicity: null,
    preferredLanguage: null,
    religionOrBelief: null,
    disabilities: null,
  },
  completionDeadline: null,
  serviceProvider: null,
  interventionId: interventionFactory.build().id,
  serviceCategoryId: null,
  serviceCategoryIds: [],
  complexityLevelId: null,
  furtherInformation: null,
  relevantSentenceId: null,
  desiredOutcomesIds: null,
  desiredOutcomes: null,
  additionalNeedsInformation: null,
  accessibilityNeeds: null,
  needsInterpreter: null,
  interpreterLanguage: null,
  hasAdditionalResponsibilities: null,
  whenUnavailable: null,
  additionalRiskInformation: null,
  usingRarDays: null,
  maximumRarDays: null,
}))
