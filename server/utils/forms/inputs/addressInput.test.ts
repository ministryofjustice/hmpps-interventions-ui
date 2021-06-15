import AddressInput from './addressInput'
import TestUtils from '../../../../testutils/testUtils'

describe(AddressInput, () => {
  describe('validate', () => {
    describe('with valid data', () => {
      it('returns an address value when all fields are provided', async () => {
        const request = TestUtils.createRequest({
          'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
          'method-other-location-address-line-2': '44 Bouverie Road',
          'method-other-location-address-town-or-city': 'Blackpool',
          'method-other-location-address-county': 'Lancashire',
          'method-other-location-address-postcode': 'SY4 0RE',
        })
        const result = await new AddressInput(request, 'method-other-location').validate()
        expect(result.value).toEqual({
          firstAddressLine: 'Harmony Living Office, Room 4',
          secondAddressLine: '44 Bouverie Road',
          townOrCity: 'Blackpool',
          county: 'Lancashire',
          postCode: 'SY4 0RE',
        })
      })
      it('returns an address value when only address line 2 is missing', async () => {
        const request = TestUtils.createRequest({
          'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
          'method-other-location-address-town-or-city': 'Blackpool',
          'method-other-location-address-county': 'Lancashire',
          'method-other-location-address-postcode': 'SY4 0RE',
        })
        const result = await new AddressInput(request, 'method-other-location').validate()
        expect(result.value).toEqual({
          firstAddressLine: 'Harmony Living Office, Room 4',
          townOrCity: 'Blackpool',
          county: 'Lancashire',
          postCode: 'SY4 0RE',
        })
      })
    })
  })
})
