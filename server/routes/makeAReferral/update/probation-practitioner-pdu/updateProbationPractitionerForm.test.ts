import TestUtils from '../../../../../testutils/testUtils'
import UpdateProbationPractitionerPduForm from './updateProbationPractitionerPduForm'

describe(UpdateProbationPractitionerPduForm, () => {
  describe('data', () => {
    describe('when a valid probation Practitioner pdu is passed', () => {
      it('returns a paramsForUpdate with the ndeliusPDU property', async () => {
        const request = TestUtils.createRequest({
          'delius-probation-practitioner-pdu': 'Norfolk',
        })
        const data = await new UpdateProbationPractitionerPduForm(request).data()

        expect(data.paramsForUpdate?.ppPdu).toEqual('Norfolk')
      })
    })
  })
})
