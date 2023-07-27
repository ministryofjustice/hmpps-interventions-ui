import { Factory } from 'fishery'
import DeliusServiceUser from '../../server/models/delius/deliusServiceUser'

export default Factory.define<DeliusServiceUser>(() => ({
  crn: 'X320741',
  profile: {
    ethnicity: 'British',
    religion: 'Agnostic',
    disabilities: [
      {
        type: 'Autism',
        notes: 'Some notes',
        start: new Date(),
      },
    ],
    primaryLanguage: 'English',
  },
  title: 'Mr',
  name: {
    forename: 'Alex',
    surname: 'River',
  },
  dateOfBirth: '1980-01-01',
  gender: 'Male',
  contactDetails: {
    noFixedAbode: false,
    emailAddress: 'alex.river@example.com',
    telephoneNumber: '0123456789',
    mobileNumber: '07123456789',
  },
}))
