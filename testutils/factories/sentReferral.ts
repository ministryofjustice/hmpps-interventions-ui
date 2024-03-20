import { Factory } from 'fishery'
import moment from 'moment-timezone'
import SentReferral from '../../server/models/sentReferral'
import { CurrentLocationType, ReferralFields } from '../../server/models/draftReferral'
import serviceCategoryFactory from './serviceCategory'
import interventionFactory from './intervention'

const exampleReferralFields = () => {
  const serviceCategoryId = serviceCategoryFactory.build().id

  return {
    createdAt: '2020-12-07T20:45:21.986389Z',
    completionDeadline: '2021-04-01',
    serviceProvider: {
      id: '1234',
      name: 'Harmony Living',
    },
    interventionId: interventionFactory.build().id,
    serviceCategoryIds: [serviceCategoryId],
    complexityLevels: [
      {
        serviceCategoryId,
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      },
    ],
    furtherInformation: 'Some information about the service user',
    relevantSentenceId: 2600295124,
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
    maximumEnforceableDays: 10,
    personCurrentLocationType: CurrentLocationType.custody,
    personCustodyPrisonId: 'aaa',
    expectedReleaseDate: moment().add(1, 'days').format('YYYY-MM-DD'),
    expectedReleaseDateMissingReason: null,
    hasExpectedReleaseDate: null,
    ndeliusPPName: 'John Davies',
    ndeliusPPEmailAddress: 'john@example.com',
    ndeliusPDU: 'Sheffield',
    ndeliusPhoneNumber: '072121212124',
    ndeliusTeamPhoneNumber: '020343434343',
    ppName: 'Bob Alice',
    ppEmailAddress: 'b.a@xyz.com',
    ppProbationOffice: 'London',
    ppPdu: 'London',
    ppEstablishment: 'aaa',
    ppPhoneNumber: '072121212125',
    ppTeamPhoneNumber: '020343434565',
    hasValidDeliusPPDetails: false,
    isReferralReleasingIn12Weeks: false,
    roleOrJobTitle: 'Probabation Practitioner',
    hasMainPointOfContactDetails: false,
    ppLocationType: null,
    allocatedCommunityPP: true,
    reasonForReferral: 'For crs',
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
  sentAt: '2022-01-01T09:02:00.000Z',
  sentBy: {
    username: 'BERNARD.BEAKS',
    userId: sequence.toString(),
    authSource: 'delius',
  },
  referenceNumber: sequence.toString().padStart(8, 'ABC'),
  supplementaryRiskId: 'a1f5ce02-53a3-47c4-bc71-45f1bdbf504c',
  referral: exampleReferralFields(),
  assignedTo: null,
  actionPlanId: null,
  endRequestedAt: null,
  endRequestedReason: null,
  endRequestedComments: null,
  endOfServiceReport: null,
  endOfServiceReportCreationRequired: false,
  concludedAt: null,
}))
