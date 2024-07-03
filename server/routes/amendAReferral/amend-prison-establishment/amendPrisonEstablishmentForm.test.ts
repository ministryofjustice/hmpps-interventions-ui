import AmendPrisonEstablishmentForm from './amendPrisonEstablishmentForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendPrisonEstablishmentForm, () => {
  describe('data', () => {
    describe('when prison establishment is passed', () => {
      it('returns a paramsForUpdate with the reasonForReferral', async () => {
        const request = TestUtils.createRequest({
          'amend-prison-establishment': `COW`,
          'reason-for-change': 'some reason',
        })
        const data = await new AmendPrisonEstablishmentForm(
          request,
          [
            {
              id: 'PBI',
              description: 'Peterborough (HMP & YOI)',
            },
            {
              id: 'COW',
              description: 'Cookham Wood (HMYOI)',
            },
          ],
          'PBI'
        ).data()

        expect(data.paramsForUpdate?.personCustodyPrisonId).toEqual(`COW`)
        expect(data.paramsForUpdate?.reasonForChange).toEqual('some reason')
        expect(data.paramsForUpdate?.oldPrisonEstablishment).toEqual('Peterborough (HMP & YOI)')
        expect(data.paramsForUpdate?.newPrisonEstablishment).toEqual('Cookham Wood (HMYOI)')
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
