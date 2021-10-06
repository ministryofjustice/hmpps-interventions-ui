import TestUtils from '../../../../../testutils/testUtils'
import ComplexityLevelForm from './complexityLevelForm'

describe(ComplexityLevelForm, () => {
  describe('data', () => {
    describe('when a complexity level id is passed', () => {
      it('returns params for update', async () => {
        const request = TestUtils.createRequest({
          'complexity-level-id': '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
        })
        const data = await new ComplexityLevelForm(request).data()

        expect(data.paramsForUpdate?.complexityLevelId).toEqual('29843fdf-8b88-4b08-a0f9-dfbd3208fd2e')
      })
    })

    describe('when complexity level id is empty', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({
          body: {
            complexityLevelId: '',
          },
        })
        const data = await new ComplexityLevelForm(request).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'complexity-level-id',
          formFields: ['complexity-level-id'],
          message: 'Select a complexity level',
        })
      })
    })
  })
})
