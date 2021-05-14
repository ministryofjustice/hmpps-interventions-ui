import { Factory } from 'fishery'
import SentReferral from '../../server/models/sentReferral'
import { ReferralFields } from '../../server/models/draftReferral'
import serviceCategoryFactory from './serviceCategory'
import interventionFactory from './intervention'

const exampleReferralFields = () => {
  const serviceCategoryId = serviceCategoryFactory.build().id

  return {
    createdAt: '2020-12-07T20:45:21.986389Z',
    completionDeadline: '2021-04-01',
    serviceProvider: {
      name: 'Harmony Living',
    },
    interventionId: interventionFactory.build().id,
    serviceCategoryId,
    serviceCategoryIds: [serviceCategoryId],
    complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
    complexityLevels: [
      {
        serviceCategoryId,
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      },
    ],
    furtherInformation: 'Some information about the service user',
    relevantSentenceId: 2600295124,
    desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
    desiredOutcomes: [
      {
        serviceCategoryId,
        desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
      },
    ],
    additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
    accessibilityNeeds: 'She uses a wheelchair',
    needsInterpreter: true,
    interpreterLanguage: 'Spanish',
    hasAdditionalResponsibilities: true,
    whenUnavailable: 'She works Mondays 9am - midday',
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
    additionalRiskInformation: 'A danger to the elderly',
    usingRarDays: true,
    maximumRarDays: 10,
  }
}

class SentReferralFactory extends Factory<SentReferral> {
  fromFields(fields: ReferralFields) {
    const referralParams = {}
    // This is a possibly clunky way of getting the
    // keys of the ReferralFields type at runtime
    Object.keys(exampleReferralFields()).forEach(key => {
      referralParams[key] = fields[key]
    })
    return this.params({ referral: referralParams })
  }

  unassigned() {
    return this.params({
      assignedTo: null,
    })
  }

  assigned() {
    return this.params({
      assignedTo: {
        username: 'UserABC',
        userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
        authSource: 'auth',
      },
    })
  }

  endRequested() {
    return this.assigned().params({
      endRequestedAt: '2021-04-28T20:45:21.986389Z',
      endRequestedReason: 'Service user was recalled',
      endRequestedComments: "you'll be seeing alex again soon i'm sure!",
    })
  }

  concluded() {
    return this.endRequested().params({
      concludedAt: '2021-04-28T20:45:21.986389Z',
    })
  }
}

export default SentReferralFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  sentAt: new Date().toISOString(),
  sentBy: {
    username: 'BERNARD.BEAKS',
    userId: sequence.toString(),
    authSource: 'delius',
  },
  referenceNumber: sequence.toString().padStart(8, 'ABC'),
  referral: exampleReferralFields(),
  assignedTo: null,
  actionPlanId: null,
  endRequestedAt: null,
  endRequestedReason: null,
  endRequestedComments: null,
  endOfServiceReport: null,
  concludedAt: null,
}))
