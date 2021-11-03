import TestUtils from '../../../../../../testutils/testUtils'
import EditOasysRiskInformationForm from './editOasysRiskInformationForm'

describe('EditOasysRiskInformationForm', () => {
  describe('from validation', () => {
    describe('when no request exists', () => {
      it('should not be valid and produce an error', async () => {
        const request = TestUtils.createRequest({})
        const form = await EditOasysRiskInformationForm.createForm(request)
        expect(form.isValid).toEqual(false)
        expect(form.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'confirm-understood',
          formFields: ['confirm-understood'],
          message:
            'You must confirm that you understand that this information will be shared with the Service Provider',
        })
      })
    })
    describe('when user does not select "confirm understood" checkbox', () => {
      it('should not be valid and produce an error', async () => {
        const request = TestUtils.createRequest({
          'confirm-understood': 'no',
        })
        const form = await EditOasysRiskInformationForm.createForm(request)
        expect(form.isValid).toEqual(false)
        expect(form.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'confirm-understood',
          formFields: ['confirm-understood'],
          message:
            'You must confirm that you understand that this information will be shared with the Service Provider',
        })
      })
    })
    describe('when user selected "confirm understood" checkbox', () => {
      it('should be valid and produce no error', async () => {
        const request = TestUtils.createRequest({
          'confirm-understood': 'understood',
        })
        const form = await EditOasysRiskInformationForm.createForm(request)
        expect(form.isValid).toEqual(true)
        expect(form.error).toBeNull()
      })
    })
  })
})
