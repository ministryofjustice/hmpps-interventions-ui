import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import ExpandedDeliusServiceUserDecorator from './expandedDeliusServiceUserDecorator'

describe(ExpandedDeliusServiceUserDecorator, () => {
  describe('address', () => {
    describe('selecting the current address', () => {
      describe('when there is only one address returned from nDelius', () => {
        it('uses that address as the current address', () => {
          const serviceUser = new ExpandedDeliusServiceUserDecorator(
            expandedDeliusServiceUserFactory.build({
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
                  },
                ],
              },
            })
          )

          expect(serviceUser.address).toEqual([
            'Flat 2 Test Walk',
            'London',
            'City of London',
            'Greater London',
            'SW16 1AQ',
          ])
        })
      })

      describe('when there are multiple addresses returned from nDelius', () => {
        describe('when all addresses have a non-null "from" field', () => {
          it('uses the address with the most recent "from" date but no elapsed "to" date', () => {
            const oldAddressWithNullToDate = {
              addressNumber: 'Flat 2',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2018-01-01',
              to: null,
              noFixedAbode: false,
            }

            const mostRecentButNoLongerCurrentAddress = {
              addressNumber: 'Flat 3',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2021-02-01',
              to: '2019-02-03',
              noFixedAbode: false,
            }

            const olderButCurrentAddress = {
              addressNumber: 'Flat 10',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2021-01-01',
              to: null,
              noFixedAbode: false,
            }

            const serviceUser = new ExpandedDeliusServiceUserDecorator(
              expandedDeliusServiceUserFactory.build({
                contactDetails: {
                  addresses: [oldAddressWithNullToDate, mostRecentButNoLongerCurrentAddress, olderButCurrentAddress],
                },
              })
            )

            expect(serviceUser.address).toEqual([
              'Flat 10 Test Walk',
              'London',
              'City of London',
              'Greater London',
              'SW16 1AQ',
            ])
          })
        })

        describe('when one address has a null "from" field', () => {
          it('returns the address with the most recent "from" field, ignoring the null value', () => {
            const oldAddress = {
              addressNumber: 'Flat 10',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2020-01-01',
              to: null,
              noFixedAbode: false,
            }
            const newAddress = {
              addressNumber: 'Flat 10',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2021-01-01',
              to: null,
              noFixedAbode: false,
            }
            const addressWithNullFromValue = {
              addressNumber: 'Flat 10',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: null,
              to: null,
              noFixedAbode: false,
            }

            const serviceUser = new ExpandedDeliusServiceUserDecorator(
              expandedDeliusServiceUserFactory.build({
                contactDetails: {
                  addresses: [oldAddress, newAddress, addressWithNullFromValue],
                },
              })
            )

            expect(serviceUser.address).toEqual([
              'Flat 10 Test Walk',
              'London',
              'City of London',
              'Greater London',
              'SW16 1AQ',
            ])
          })
        })

        describe('when all addresses have a null or undefined "from" field', () => {
          it('returns "null" as we are unable to determine the most recent', () => {
            const firstAddressNullFromDate = {
              addressNumber: 'Flat 10',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: null,
              to: null,
              noFixedAbode: false,
            }
            const secondAddressUndefinedFromDate = {
              addressNumber: 'Flat 10',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              to: null,
              noFixedAbode: false,
            }

            const serviceUser = new ExpandedDeliusServiceUserDecorator(
              expandedDeliusServiceUserFactory.build({
                contactDetails: {
                  addresses: [firstAddressNullFromDate, secondAddressUndefinedFromDate],
                },
              })
            )

            expect(serviceUser.address).toBeNull()
          })
        })

        describe('when there is no current address added for the service user', () => {
          it('should return null', () => {
            const serviceUser = new ExpandedDeliusServiceUserDecorator(
              expandedDeliusServiceUserFactory.build({
                contactDetails: {
                  addresses: [
                    {
                      from: '2021-04-09',
                      to: '2021-04-30',
                      noFixedAbode: true,
                      postcode: 'xxx',
                    },
                    {
                      from: '2020-06-29',
                      to: '2021-04-09',
                      noFixedAbode: false,
                      addressNumber: 'xxx',
                      streetName: 'xxx',
                      district: 'xxx',
                      postcode: 'xxx',
                    },
                  ],
                },
              })
            )

            expect(serviceUser.address).toBeNull()
          })
        })
      })

      describe('when there is no address returned from nDelius', () => {
        it('returns null', () => {
          const serviceUser = new ExpandedDeliusServiceUserDecorator(
            expandedDeliusServiceUserFactory.build({
              contactDetails: {
                addresses: [],
              },
            })
          )

          expect(serviceUser.address).toBeNull()
        })
      })
    })
    describe('formatting', () => {
      describe('when there is an address number but no building name', () => {
        it('returns an array of the address fields with address number prefixed to street name', () => {
          const serviceUser = expandedDeliusServiceUserFactory.build({
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
                },
              ],
            },
          })

          expect(new ExpandedDeliusServiceUserDecorator(serviceUser).address).toEqual([
            'Flat 2 Test Walk',
            'London',
            'City of London',
            'Greater London',
            'SW16 1AQ',
          ])
        })
      })

      describe('when there is a building name but no address number', () => {
        it('returns an array of the address fields with building name prefixed to street name', () => {
          const serviceUser = expandedDeliusServiceUserFactory.build({
            contactDetails: {
              addresses: [
                {
                  addressNumber: null,
                  buildingName: 'Classic House',
                  streetName: 'Test Walk',
                  postcode: 'SW16 1AQ',
                  town: 'London',
                  district: 'City of London',
                  county: 'Greater London',
                  from: '2019-01-01',
                  to: null,
                  noFixedAbode: false,
                },
              ],
            },
          })

          expect(new ExpandedDeliusServiceUserDecorator(serviceUser).address).toEqual([
            'Classic House, Test Walk',
            'London',
            'City of London',
            'Greater London',
            'SW16 1AQ',
          ])
        })
      })

      describe('when there is both an address number and building name', () => {
        it('returns an array of the address fields with address and building name prefixed to street name', () => {
          const serviceUser = expandedDeliusServiceUserFactory.build({
            contactDetails: {
              addresses: [
                {
                  addressNumber: '4',
                  buildingName: 'Classic House',
                  streetName: 'Test Walk',
                  postcode: 'SW16 1AQ',
                  town: 'London',
                  district: 'City of London',
                  county: 'Greater London',
                  from: '2019-01-01',
                  to: null,
                  noFixedAbode: false,
                },
              ],
            },
          })

          expect(new ExpandedDeliusServiceUserDecorator(serviceUser).address).toEqual([
            '4 Classic House, Test Walk',
            'London',
            'City of London',
            'Greater London',
            'SW16 1AQ',
          ])
        })
      })
    })
  })
})
