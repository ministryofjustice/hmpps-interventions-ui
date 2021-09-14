import { Factory } from 'fishery'
import { ExpandedDeliusServiceUser } from '../../server/models/delius/deliusServiceUser'

export default Factory.define<ExpandedDeliusServiceUser>(() => ({
  otherIds: {
    crn: 'X123456',
  },
  offenderProfile: {
    ethnicity: 'British',
    religion: 'Agnostic',
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
    offenderLanguages: {
      primaryLanguage: 'English',
    },
  },
  title: 'Mr',
  firstName: 'Alex',
  surname: 'River',
  dateOfBirth: '1980-01-01',
  gender: 'Male',
  contactDetails: {
    addresses: [
      {
        addressNumber: 'Flat 2',
        buildingName: null,
        streetName: 'Test Walk',
        postcode: 'SW16 1AQ',
        town: 'London',
        district: 'City of London',
        county: 'Greater London',
        from: '2019-01-01',
        to: null,
        noFixedAbode: false,
        status: {
          code: 'M',
        },
      },
    ],
    emailAddresses: ['alex.river@example.com'],
    phoneNumbers: [
      {
        number: '0123456789',
        type: 'MOBILE',
      },
    ],
  },
}))
