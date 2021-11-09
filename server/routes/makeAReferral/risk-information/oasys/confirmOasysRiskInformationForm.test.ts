import TestUtils from '../../../../../testutils/testUtils'
import ConfirmOasysRiskInformationForm from './confirmOasysRiskInformationForm'

describe('ConfirmOasysRiskInformationForm', () => {
  describe('from validation', () => {
    describe('when user does not select a radio option', () => {
      it('should not be valid and produce an error', async () => {
        const request = TestUtils.createRequest({})
        const form = await ConfirmOasysRiskInformationForm.createForm(request)
        expect(form.isValid).toEqual(false)
        expect(form.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'edit-risk-confirmation',
          formFields: ['edit-risk-confirmation'],
          message: 'Select Yes if you want to edit this OASys risk information',
        })
      })
    })
    describe('when user selects "No" without confirming', () => {
      it('should not be valid and produce an error', async () => {
        const request = TestUtils.createRequest({
          'edit-risk-confirmation': 'no',
        })
        const form = await ConfirmOasysRiskInformationForm.createForm(request)
        expect(form.isValid).toEqual(false)
        expect(form.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'confirm-understood',
          formFields: ['confirm-understood'],
          message:
            'You must confirm that you understand that this information will be shared with the Service Provider',
        })
      })
    })
    describe('when user selects "No" with confirmation', () => {
      it('should be valid and produce no error', async () => {
        const request = TestUtils.createRequest({
          'edit-risk-confirmation': 'no',
          'confirm-understood': 'understood',
        })
        const form = await ConfirmOasysRiskInformationForm.createForm(request)
        expect(form.isValid).toEqual(true)
        expect(form.userWantsToEdit).toEqual(false)
        expect(form.error).toBeNull()
      })
    })
    describe('when user selects "Yes"', () => {
      it('should be valid and produce no error', async () => {
        const request = TestUtils.createRequest({
          'edit-risk-confirmation': 'yes',
        })
        const form = await ConfirmOasysRiskInformationForm.createForm(request)
        expect(form.isValid).toEqual(true)
        expect(form.userWantsToEdit).toEqual(true)
        expect(form.error).toBeNull()
      })
    })
  })
})
