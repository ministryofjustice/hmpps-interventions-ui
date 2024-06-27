import AmendPrisonEstablishmentForm from './amendPrisonEstablishmentForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendPrisonEstablishmentForm, () => {
  describe('data', () => {
    describe('when prison establishment is passed', () => {
      it('returns a paramsForUpdate with the reasonForReferral', async () => {
        const request = TestUtils.createRequest({
          'amend-prison-establishment': `Bronzefield (HMP & YOI)`,
          'reason-for-change': 'some reason',
        })
        const data = await new AmendPrisonEstablishmentForm(request).data()

        expect(data.paramsForUpdate?.personCustodyPrisonId).toEqual(`Bronzefield (HMP & YOI)`)
        expect(data.paramsForUpdate?.reasonForChange).toEqual('some reason')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the prison establishment is not present', async () => {
      const request = TestUtils.createRequest({
        'amend-prison-establishment': null,
        'reason-for-change': 'some reason',
      })

      const data = await new AmendPrisonEstablishmentForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'amend-prison-establishment',
        formFields: ['amend-prison-establishment'],
        message: 'Enter a prison establishment',
      })
    })
    it('returns an error when the reason for change is not present', async () => {
      const request = TestUtils.createRequest({
        'amend-prison-establishment': `Bronzefield (HMP & YOI)`,
        'reason-for-change': null,
      })

      const data = await new AmendPrisonEstablishmentForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'reason-for-change',
        formFields: ['reason-for-change'],
        message: 'Enter a reason',
      })
    })
  })
})
