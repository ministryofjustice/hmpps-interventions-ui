import { Factory } from 'fishery'
import SentReferralDashboard from '../../server/models/sentReferralDashboard'

class SentReferralForDashboardFactory extends Factory<SentReferralDashboard> {
  assigned() {
    return this.params({
      assignedTo: {
        username: 'UserABC',
        userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
        authSource: 'auth',
      },
    })
  }

  unassigned() {
    return this.params({
      assignedTo: null,
    })
  }

  concluded() {
    return this.params({
      concludedAt: '2021-04-28T20:45:21.986389Z',
    })
  }

  title() {
    return this.params({
      interventionTitle: 'Accommodation Services - West Midlands',
    })
  }
}

export default SentReferralForDashboardFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  sentAt: new Date().toISOString(),
  sentBy: {
    username: 'BERNARD.BEAKS',
    userId: sequence.toString(),
    authSource: 'delius',
  },
  referenceNumber: sequence.toString().padStart(8, 'ABC'),
  supplementaryRiskId: 'a1f5ce02-53a3-47c4-bc71-45f1bdbf504c',
  assignedTo: {
    username: 'UserABC',
    userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
    authSource: 'auth',
  },
  serviceProvider: {
    id: '1234',
    name: 'Harmony Living',
  },
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
  interventionTitle: 'Accommodation Services - West Midlands',
  concludedAt: new Date().toISOString(),
}))
