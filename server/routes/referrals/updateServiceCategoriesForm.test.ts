import TestUtils from '../../../testutils/testUtils'
import UpdateServiceCategoriesForm from './updateServiceCategoriesForm'

describe(UpdateServiceCategoriesForm, () => {
  describe('data', () => {
    describe('when service category ids are passed', () => {
      it('returns params for update when the service-category-ids property is present and not empty in the body', async () => {
        const request = TestUtils.createRequest({
          'service-category-ids': ['29843fdf-8b88-4b08-a0f9-dfbd3208fd2e', '43557c7a-c286-49c2-a994-d0a821295c7a'],
        })
        const data = await new UpdateServiceCategoriesForm(request).data()

        expect(data.paramsForUpdate?.serviceCategoryIds).toEqual([
          '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
          '43557c7a-c286-49c2-a994-d0a821295c7a',
        ])
      })
    })

    describe('when service category ids are empty', () => {
      it('returns an error when the service-category-ids property is empty in the body', async () => {
        const request = TestUtils.createRequest({
          body: {
            'service-category-ids': [],
          },
        })
        const data = await new UpdateServiceCategoriesForm(request).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'service-category-ids',
          formFields: ['service-category-ids'],
          message: 'At least one service category must be selected',
        })
      })
    })
  })
})
