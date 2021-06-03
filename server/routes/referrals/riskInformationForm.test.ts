import RiskInformationForm from './riskInformationForm'
import TestUtils from '../../../testutils/testUtils'

describe(RiskInformationForm, () => {
  describe('data', () => {
    describe('with valid input', () => {
      it('returns a paramsForUpdate with the additionalRiskInformation key', async () => {
        const request = TestUtils.createRequest({ 'additional-risk-information': 'Past assault of strangers' })

        const data = await new RiskInformationForm(request).data()

        expect(data.paramsForUpdate).toEqual({ additionalRiskInformation: 'Past assault of strangers' })
      })
    })

    describe('with blank additional-risk-information', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({ 'additional-risk-information': '   ' })

        const data = await new RiskInformationForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              formFields: ['additional-risk-information'],
              errorSummaryLinkedField: 'additional-risk-information',
              message: 'Enter risk information',
            },
          ],
        })
      })
    })

    describe('with additional-risk-information over 4000 characters long', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({ 'additional-risk-information': 'a'.repeat(4001) })

        const data = await new RiskInformationForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              formFields: ['additional-risk-information'],
              errorSummaryLinkedField: 'additional-risk-information',
              message: 'Risk information must be 4000 characters or fewer',
            },
          ],
        })
      })
    })
  })
})
