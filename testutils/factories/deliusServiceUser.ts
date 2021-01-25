import { Factory } from 'fishery'
import { DeliusServiceUser } from '../../server/services/communityApiService'

export default Factory.define<DeliusServiceUser>(() => ({
  otherIds: {
    crn: 'X123456',
  },
  offenderProfile: {
    offenderLanguages: {
      primaryLanguage: 'English',
    },
  },
  title: 'Mr',
  firstName: 'Alex',
  surname: 'River',
  dateOfBirth: '1980-01-01',
  gender: 'Male',
  ethnicity: 'British',
  religionOrBelief: 'Agnostic',
  disabilities: [
    {
      disabilityType: {
        description: 'Autism',
      },
      endDate: '',
      notes: 'Some notes',
      startDate: '2019-01-22',
    },
  ],
}))
