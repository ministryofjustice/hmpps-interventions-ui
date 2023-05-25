import { Factory } from 'fishery'
import moment from 'moment-timezone'
import DraftReferral, { CurrentLocationType } from '../../server/models/draftReferral'
import serviceCategoryFactory from './serviceCategory'
import interventionFactory from './intervention'
import ServiceCategory from '../../server/models/serviceCategory'

class DraftReferralFactory extends Factory<DraftReferral> {
  justCreated() {
    return this
  }

  createdAt(date: Date) {
    return this.params({ createdAt: date.toISOString() })
  }

  serviceCategorySelected(serviceCategoryId?: string) {
    const resolvedServiceCategoryId = serviceCategoryId ?? serviceCategoryFactory.build().id
    return this.params({
      serviceCategoryIds: [resolvedServiceCategoryId],
    })
  }

  serviceCategoriesSelected(serviceCategoryIds?: string[]) {
    const resolvedServiceCategoryIds =
      serviceCategoryIds ?? serviceCategoryFactory.buildList(3).map(category => category.id)

    return this.params({ serviceCategoryIds: resolvedServiceCategoryIds })
  }

  completionDeadlineSet() {
    return this.params({ completionDeadline: '2021-08-24' })
  }

  unfilled() {
    return this
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

  selectedServiceCategories(serviceCategories: ServiceCategory[]) {
    const resolvedServiceCategoryIds = serviceCategories.map(serviceCategory => serviceCategory.id)
    return this.serviceUserSelected().params({
      serviceCategoryIds: resolvedServiceCategoryIds,
    })
  }

  filledFormUpToRiskInformation(serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()]) {
    return this.selectedServiceCategories(serviceCategories).params({
      additionalRiskInformation: 'A danger to the elderly',
    })
  }

  filledFormUpToNeedsAndRequirements(
    serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()],
    skipAdditionalRiskInformation = false
  ) {
    let filledForm: this
    if (skipAdditionalRiskInformation) {
      filledForm = this.selectedServiceCategories(serviceCategories)
    } else {
      filledForm = this.filledFormUpToRiskInformation(serviceCategories)
    }
    return filledForm.params({
      additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
      accessibilityNeeds: 'She uses a wheelchair',
      needsInterpreter: true,
      interpreterLanguage: 'Spanish',
      hasAdditionalResponsibilities: true,
      whenUnavailable: 'She works Mondays 9am - midday',
    })
  }

  filledFormUpToCurrentLocation(
    serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()],
    skipAdditionalRiskInformation = false,
    currentLocationType: CurrentLocationType = CurrentLocationType.custody
  ) {
    return this.filledFormUpToNeedsAndRequirements(serviceCategories, skipAdditionalRiskInformation).params({
      personCurrentLocationType: currentLocationType,
      personCustodyPrisonId: currentLocationType === CurrentLocationType.custody ? 'abc' : null,
    })
  }

  filledFormUpToExpectedReleaseDate(
    serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()],
    skipAdditionalRiskInformation = false
  ) {
    const tomorrow = moment().add(1, 'days')
    return this.filledFormUpToCurrentLocation(serviceCategories, skipAdditionalRiskInformation).params({
      expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
    })
  }

  filledFormUpToRelevantSentence(serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()]) {
    return this.filledFormUpToCurrentLocation(serviceCategories).params({
      relevantSentenceId: 123456789,
    })
  }

  addSelectedDesiredOutcomes(serviceCategories: ServiceCategory[]) {
    return this.params({
      desiredOutcomes: serviceCategories.map(serviceCategory => {
        return {
          serviceCategoryId: serviceCategory.id,
          desiredOutcomesIds: serviceCategory.desiredOutcomes.map(desiredOutcome => desiredOutcome.id),
        }
      }),
    })
  }

  addSelectedComplexityLevel(serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()]) {
    return this.params({
      complexityLevels: serviceCategories.map(serviceCategory => {
        return {
          serviceCategoryId: serviceCategory.id,
          complexityLevelId: serviceCategory.complexityLevels[0].id,
        }
      }),
    })
  }

  filledFormUpToEnforceableDays(serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()]) {
    return this.filledFormUpToRelevantSentence(serviceCategories)
      .addSelectedDesiredOutcomes(serviceCategories)
      .addSelectedComplexityLevel(serviceCategories)
      .params({
        maximumEnforceableDays: 10,
      })
  }

  filledFormUpToCompletionDate(serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()]) {
    return this.filledFormUpToEnforceableDays(serviceCategories).params({
      completionDeadline: '2021-08-24',
    })
  }

  filledFormUpToFurtherInformation(serviceCategories: ServiceCategory[] = [serviceCategoryFactory.build()]) {
    return this.filledFormUpToCompletionDate(serviceCategories).params({
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
  serviceProvider: {
    id: 'spId',
    name: 'Test Service Provider',
  },
  interventionId: interventionFactory.build().id,
  serviceCategoryIds: [],
  complexityLevelId: null,
  complexityLevels: null,
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
  maximumEnforceableDays: null,
  hasExpectedReleaseDate: null,
  expectedReleaseDate: null,
  expectedReleaseDateMissingReason: null,
  contractTypeName: interventionFactory.build().contractType.name,
  personCurrentLocationType: null,
  personCustodyPrisonId: null,
  ndeliusPPName: 'Victor Drake',
  ndeliusPPEmailAddress: 'a.b@xyz.com',
  ndeliusPDU: 'London',
  ppName: null,
  ppEmailAddress: null,
  ppPdu: null,
  ppProbationOffice: null,
}))
