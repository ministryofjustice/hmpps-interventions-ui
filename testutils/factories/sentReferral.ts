import { Factory } from 'fishery'
import { ReferralFields, SentReferral } from '../../server/services/interventionsService'
import serviceCategoryFactory from './serviceCategory'

const exampleReferralFields = () => {
  return {
    createdAt: '2020-12-07T20:45:21.986389Z',
    completionDeadline: '2021-04-01',
    serviceProvider: {
      name: 'Harmony Living',
    },
    serviceCategoryId: serviceCategoryFactory.build().id,
    complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
    furtherInformation: 'Some information about the service user',
    relevantSentenceId: 2600295124,
    desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
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
  endOfServiceReport: null,
}))
