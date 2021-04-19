import TestUtils from '../../../testutils/testUtils'
import EndOfServiceReportFurtherInformationForm from './endOfServiceReportFurtherInformationForm'

describe(EndOfServiceReportFurtherInformationForm, () => {
  describe('paramsForUpdate', () => {
    it('returns params to be used to update the appointment on the interventions service', () => {
      const form = new EndOfServiceReportFurtherInformationForm(
        TestUtils.createRequest({ 'further-information': 'Some further information' })
      )

      expect(form.paramsForUpdate).toEqual({ furtherInformation: 'Some further information' })
    })
  })
})
