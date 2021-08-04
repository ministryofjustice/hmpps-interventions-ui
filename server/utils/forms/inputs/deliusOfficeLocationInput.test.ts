import TestUtils from '../../../../testutils/testUtils'
import DeliusOfficeLocationInput, { DeliusOfficeLocationErrorMessages } from './deliusOfficeLocationInput'
import DeliusOfficeLocation from '../../../models/deliusOfficeLocation'

describe(DeliusOfficeLocationInput, () => {
  const errorMessage: DeliusOfficeLocationErrorMessages = {
    empty: 'Select an office',
    invalidOfficeSelection: 'Invalid office selection',
  }
  const deliusOfficeLocations: DeliusOfficeLocation[] = [
    {
      probationOfficeId: 76,
      name: 'Havering: Pioneer House',
      address: 'Pioneer House, North Street, Hornchurch, Essex, RM11 1QZ',
      probationRegionId: 'J',
      govUkURL: 'https://www.gov.uk/guidance/havering-pioneer-house',
      deliusCRSLocationId: 'CRS0001',
    },
  ]
  describe('validate', () => {
    describe('with valid data', () => {
      it('returns an office location code', async () => {
        const request = TestUtils.createRequest({
          'delius-office-location-code': 'CRS0001',
        })
        const result = await new DeliusOfficeLocationInput(
          request,
          'delius-office-location-code',
          deliusOfficeLocations,
          errorMessage
        ).validate()
        expect(result.value).toEqual('CRS0001')
      })
    })
    describe('with invalid data', () => {
      describe('with empty selection', () => {
        it('should present an error', async () => {
          const request = TestUtils.createRequest({})
          const result = await new DeliusOfficeLocationInput(
            request,
            'delius-office-location-code',
            deliusOfficeLocations,
            errorMessage
          ).validate()
          expect(result.error).toEqual({
            errors: [
              {
                errorSummaryLinkedField: 'delius-office-location-code',
                formFields: ['delius-office-location-code'],
                message: 'Select an office',
              },
            ],
          })
        })
      })

      describe('with an invalid selection', () => {
        it('should present an error', async () => {
          const request = TestUtils.createRequest({
            'delius-office-location-code': 'CRS0002',
          })
          const result = await new DeliusOfficeLocationInput(
            request,
            'delius-office-location-code',
            deliusOfficeLocations,
            errorMessage
          ).validate()
          expect(result.error).toEqual({
            errors: [
              {
                errorSummaryLinkedField: 'delius-office-location-code',
                formFields: ['delius-office-location-code'],
                message: 'Invalid office selection',
              },
            ],
          })
        })
      })
    })
  })
})
