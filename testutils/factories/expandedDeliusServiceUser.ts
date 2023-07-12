import { Factory } from 'fishery'
import DeliusServiceUser from '../../server/models/delius/deliusServiceUser'

export default Factory.define<DeliusServiceUser>(() => ({
  crn: 'X123456',
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
    mobileNumber: '0123456789',
    mainAddress: {
      buildingNumber: 'Flat 2',
      streetName: 'Test Walk',
      postcode: 'SW16 1AQ',
      town: 'London',
      district: 'City of London',
      county: 'Greater London',
      from: new Date(),
      noFixedAbode: false,
      status: {
        code: 'M',
      },
    },
  },
}))
