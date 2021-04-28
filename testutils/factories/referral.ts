import { Factory } from 'fishery'
import { v4 as uuidv4 } from 'uuid'
import ServiceProviderFactory from './serviceProvider'
import { Referral } from '../../server/services/interventionsService'

class ReferralFactory extends Factory<Referral> {
  justCreated() {
    return this.params({})
  }

  draft() {
    const today = new Date()
    return this.justCreated().params({
      formFields: {
        completionDeadline: new Date(today.setMonth(today.getMonth() + 6)).toISOString(),
        complexityLevelId: uuidv4(),
        furtherInformation: '',
        relevantSentenceId: 8976125623,
        desiredOutcomesIds: [uuidv4(), uuidv4()],
        additionalNeedsInformation: '',
        accessibilityNeeds: 'alex requires wheelchair access',
        needsInterpreter: true,
        interpreterLanguage: 'urdu',
        hasAdditionalResponsibilities: true,
        whenUnavailable: 'wednesdays',
        additionalRiskInformation: '',
        usingRarDays: true,
        maximumRarDays: 5,
      },
    })
  }

  sent() {
    return this.draft().params({
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
    return this.draft().params({
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
          userId: uuidv4(),
          authSource: 'auth',
        },
        actionPlanId: null,
        endOfServiceReport: null,
      },
    })
  }

  ended() {
    return this.assigned().params({
      endedFields: {
        endedAt: '2021-05-13T12:30:00Z',
        endedBy: {
          username: 'BERNARD.BEAKS',
          userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
          authSource: 'delius',
        },
        cancellationReason: 'Service user has been recalled',
        cancellationComments: 'Alex was arrested for driving without insurance and immediately recalled',
      },
    })
  }
}

export default ReferralFactory.define(({ sequence }) => ({
  id: uuidv4(),
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
    id: uuidv4(),
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
