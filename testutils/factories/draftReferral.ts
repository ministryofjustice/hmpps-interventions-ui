import { Factory } from 'fishery'
import DraftReferral from '../../server/models/draftReferral'
import serviceCategoryFactory from './serviceCategory'

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

  completionDeadlineSet() {
    return this.params({ completionDeadline: '2021-08-24' })
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
  serviceCategoryId: null,
  complexityLevelId: null,
  furtherInformation: null,
  relevantSentenceId: null,
  desiredOutcomesIds: null,
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
