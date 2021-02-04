import DeliusServiceUserSerializer from './deliusServiceUserSerializer'

describe(DeliusServiceUserSerializer, () => {
  describe('call', () => {
    it('transforms a DeliusServiceUser into a format expected by the Interventions Service, removing "expired" disabilities', () => {
      const currentDisabilityEndDate = new Date()
      currentDisabilityEndDate.setDate(currentDisabilityEndDate.getDate() + 1)

      const deliusServiceUser = {
        otherIds: {
          crn: 'X123456',
        },
        offenderProfile: {
          ethnicity: 'British',
          religion: 'Agnostic',
          offenderLanguages: {
            primaryLanguage: 'English',
          },
          disabilities: [
            {
              disabilityType: {
                description: 'Autism',
              },
              endDate: '',
              notes: 'Some notes',
              startDate: '2019-01-22',
            },
            {
              disabilityType: {
                description: 'Sciatica',
              },
              endDate: currentDisabilityEndDate.toString(),
              notes: 'Some notes',
              startDate: '2020-01-01',
            },
            {
              disabilityType: {
                description: 'An old disability',
              },
              endDate: '2020-01-22',
              notes: 'Some notes',
              startDate: '2020-01-22',
            },
          ],
        },
        title: 'Mr',
        firstName: 'Alex',
        surname: 'River',
        contactDetails: {
          emailAddresses: ['alex.river@example.com'],
          phoneNumbers: [
            {
              number: '07123456789',
              type: 'MOBILE',
            },
          ],
        },
        dateOfBirth: '1980-01-01',
        gender: 'Male',
      }

      const serviceUser = new DeliusServiceUserSerializer(deliusServiceUser).call()

      expect(serviceUser.crn).toEqual('X123456')
      expect(serviceUser.title).toEqual('Mr')
      expect(serviceUser.firstName).toEqual('Alex')
      expect(serviceUser.lastName).toEqual('River')
      expect(serviceUser.contactDetails.email).toEqual('alex.river@example.com')
      expect(serviceUser.contactDetails.mobile).toEqual('07123456789')
      expect(serviceUser.dateOfBirth).toEqual('1980-01-01')
      expect(serviceUser.gender).toEqual('Male')
      expect(serviceUser.ethnicity).toEqual('British')
      expect(serviceUser.religionOrBelief).toEqual('Agnostic')
      expect(serviceUser.preferredLanguage).toEqual('English')
      expect(serviceUser.disabilities).toEqual(['Autism', 'Sciatica'])
    })

    describe('when there are fields missing in the response', () => {
      // this is the current response when running the Community API locally
      const incompleteDeliusServiceUser = {
        firstName: 'Aadland',
        surname: 'Bertrand',
        dateOfBirth: '2065-07-19',
        gender: 'Male',
        otherIds: {
          crn: 'X320741',
        },
        contactDetails: {},
        offenderProfile: {
          offenderLanguages: {},
        },
      }

      it('sets null values on the serialized user for the missing values', () => {
        const serviceUser = new DeliusServiceUserSerializer(incompleteDeliusServiceUser).call()

        expect(serviceUser.crn).toEqual('X320741')
        expect(serviceUser.title).toEqual(null)
        expect(serviceUser.firstName).toEqual('Aadland')
        expect(serviceUser.lastName).toEqual('Bertrand')
        expect(serviceUser.contactDetails.email).toEqual(null)
        expect(serviceUser.contactDetails.mobile).toEqual(null)
        expect(serviceUser.dateOfBirth).toEqual('2065-07-19')
        expect(serviceUser.gender).toEqual('Male')
        expect(serviceUser.ethnicity).toEqual(null)
        expect(serviceUser.religionOrBelief).toEqual(null)
        expect(serviceUser.preferredLanguage).toEqual(null)
        expect(serviceUser.disabilities).toEqual(null)
      })
    })
  })
})
