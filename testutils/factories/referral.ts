import { Factory } from 'fishery'
import ServiceProviderFactory from './serviceProvider'
import { Referral } from '../../server/services/interventionsService'

class ReferralFactory extends Factory<Referral> {
  draft() {
    // todo
    return this.params({})
  }

  sent() {
    return this.params({
      sentFields: {
        sentAt: new Date().toISOString(),
        sentBy: {
          username: 'bernard.beaks',
          userId: '123456',
          authSource: 'delius',
        },
        referenceNumber: 'KA3825AC',
        assignedTo: null,
        actionPlanId: null,
        endOfServiceReport: null,
      },
    })
  }

  assigned() {
    return this.params({
      sentFields: {
        sentAt: new Date().toISOString(),
        sentBy: {
          username: 'bernard.beaks',
          userId: '123456',
          authSource: 'delius',
        },
        referenceNumber: 'KA3825AC',
        assignedTo: {
          username: 'UserABC',
          userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
          authSource: 'auth',
        },
        actionPlanId: null,
        endOfServiceReport: null,
      },
    })
  }

  ended() {
    // todo
    return this.params({})
  }
}

export default ReferralFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  createdAt: new Date().toISOString(),
  serviceUser: {
    crn: sequence.toString(),
    title: 'Mr',
    firstName: 'Alex',
    lastName: 'River',
    dateOfBirth: '1980-01-01',
    gender: 'Male',
    ethnicity: 'British',
    preferredLanguage: 'English',
    religionOrBelief: 'Agnostic',
    disabilities: ['Autism spectrum condition', 'Sciatica'],
  },
  serviceCategory: {
    id: sequence.toString(),
    name: 'accommodation',
  },
  serviceProvider: ServiceProviderFactory.build(),

  formFields: {
    completionDeadline: null,
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
  },
  sentFields: null,
  endedFields: null,
}))
