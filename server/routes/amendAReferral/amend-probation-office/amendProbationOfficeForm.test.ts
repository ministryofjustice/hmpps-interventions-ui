import AmendProbationOfficeForm from './amendProbationOfficeForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendProbationOfficeForm, () => {
  describe('paramsForUpdate', () => {
    describe('when probation office is passed', () => {
      it('returns a paramsForUpdate with the probation office', async () => {
        const request = TestUtils.createRequest({
          'probation-office': `Leicestershire: Loughborough Probation Office`,
        })
        const form = await AmendProbationOfficeForm.createForm(request)

        expect(form.paramsForUpdate?.probationOffice).toEqual(`Leicestershire: Loughborough Probation Office`)
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the probation office is not present', async () => {
      const request = TestUtils.createRequest({
        'probation-office': null,
      })

      const form = await AmendProbationOfficeForm.createForm(request)

      expect(form.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'probation-office',
        formFields: ['probation-office'],
        message: 'Select a probation office from the list',
      })
    })
  })
})
