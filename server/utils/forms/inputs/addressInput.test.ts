import AddressInput from './addressInput'
import TestUtils from '../../../../testutils/testUtils'

describe(AddressInput, () => {
  const errorMessages = {
    addressLine1Empty: 'Enter a value for address line 1',
    townOrCityEmpty: 'Enter a town or city',
    countyEmpty: 'Enter a county',
    postCodeEmpty: 'Enter a postcode',
    postCodeInvalid: 'Enter a valid postcode',
  }
  describe('validate', () => {
    describe('with valid data', () => {
      it('returns an address value when all fields are provided', async () => {
        const request = TestUtils.createRequest({
          'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
          'method-other-location-address-line-2': '44 Bouverie Road',
          'method-other-location-address-town-or-city': 'Blackpool',
          'method-other-location-address-county': 'Lancashire',
          'method-other-location-address-postcode': 'EC1A 1BB',
        })
        const result = await new AddressInput(request, 'method-other-location', errorMessages).validate()
        expect(result.value).toEqual({
          firstAddressLine: 'Harmony Living Office, Room 4',
          secondAddressLine: '44 Bouverie Road',
          townOrCity: 'Blackpool',
          county: 'Lancashire',
          postCode: 'EC1A 1BB',
        })
      })
      it('returns an address value when only address line 1 and postcode is provided', async () => {
        const request = TestUtils.createRequest({
          'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
          'method-other-location-address-postcode': 'SY4 0RE',
        })
        const result = await new AddressInput(request, 'method-other-location', errorMessages).validate()
        expect(result.value).toEqual({
          firstAddressLine: 'Harmony Living Office, Room 4',
          secondAddressLine: '',
          townOrCity: '',
          county: '',
          postCode: 'SY4 0RE',
        })
      })
      describe('postcode validation', () => {
        function createRequest(postCode: string): Record<string, string> {
          return {
            'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
            'method-other-location-address-town-or-city': 'Blackpool',
            'method-other-location-address-county': 'Lancashire',
            'method-other-location-address-postcode': postCode,
          }
        }
        async function validatePostCode(postCode: string): Promise<void> {
          const request = TestUtils.createRequest(createRequest(postCode))
          const result = await new AddressInput(request, 'method-other-location', errorMessages).validate()
          expect(result.value?.postCode).toEqual(postCode)
        }
        it('returns an address value when all postcode is valid', async () => {
          await validatePostCode('aa9a 9aa')
          await validatePostCode('a9a 9aa')
          await validatePostCode('a9 9aa')
          await validatePostCode('a99 9aa')
          await validatePostCode('aa9 9aa')
          await validatePostCode('aa99 9aa')
          await validatePostCode(' aa999aa ')
        })
      })
    })
    describe('with invalid data', () => {
      it('returns an error when address details are not entered', async () => {
        const request = TestUtils.createRequest({})
        const result = await new AddressInput(request, 'method-other-location', errorMessages).validate()
        expect(result.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'method-other-location-address-line-1',
              formFields: ['method-other-location-address-line-1'],
              message: 'Enter a value for address line 1',
            },
            {
              errorSummaryLinkedField: 'method-other-location-address-postcode',
              formFields: ['method-other-location-address-postcode'],
              message: 'Enter a postcode',
            },
            {
              errorSummaryLinkedField: 'method-other-location-address-postcode',
              formFields: ['method-other-location-address-postcode'],
              message: 'Enter a valid postcode',
            },
          ],
        })
      })
      it('returns an error when address details have blank values', async () => {
        const request = TestUtils.createRequest({
          'method-other-location-address-line-1': '',
          'method-other-location-address-town-or-city': '',
          'method-other-location-address-county': '',
          'method-other-location-address-postcode': '',
        })
        const result = await new AddressInput(request, 'method-other-location', errorMessages).validate()
        expect(result.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'method-other-location-address-line-1',
              formFields: ['method-other-location-address-line-1'],
              message: 'Enter a value for address line 1',
            },
            {
              errorSummaryLinkedField: 'method-other-location-address-postcode',
              formFields: ['method-other-location-address-postcode'],
              message: 'Enter a postcode',
            },
            {
              errorSummaryLinkedField: 'method-other-location-address-postcode',
              formFields: ['method-other-location-address-postcode'],
              message: 'Enter a valid postcode',
            },
          ],
        })
      })

      describe('post code validation', () => {
        it('returns an error when postcode is invalid', async () => {
          const result = await new AddressInput(
            TestUtils.createRequest({
              'method-other-location-address-line-1': 'Harmony Living Office, Room 4',
              'method-other-location-address-town-or-city': 'Blackpool',
              'method-other-location-address-county': 'Lancashire',
              'method-other-location-address-postcode': 'aaa1 1aa',
            }),
            'method-other-location',
            errorMessages
          ).validate()
          expect(result.error).toEqual({
            errors: [
              {
                errorSummaryLinkedField: 'method-other-location-address-postcode',
                formFields: ['method-other-location-address-postcode'],
                message: 'Enter a valid postcode',
              },
            ],
          })
        })
      })
    })
  })
})
