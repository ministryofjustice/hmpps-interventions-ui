import TestUtils from '../../../testutils/testUtils'
import DesiredOutcomesForm from './desiredOutcomesForm'

describe(DesiredOutcomesForm, () => {
  describe('data', () => {
    describe('when desired outcomes ids are passed', () => {
      it('returns params for update', async () => {
        const request = TestUtils.createRequest({
          'desired-outcomes-ids': ['29843fdf-8b88-4b08-a0f9-dfbd3208fd2e', '43557c7a-c286-49c2-a994-d0a821295c7a'],
        })
        const data = await new DesiredOutcomesForm(request).data()

        expect(data.paramsForUpdate?.desiredOutcomesIds).toEqual([
          '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
          '43557c7a-c286-49c2-a994-d0a821295c7a',
        ])
      })
    })

    describe('when desired outcomes ids are empty', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({
          body: {
            'desired-outcomes-ids': [],
          },
        })
        const data = await new DesiredOutcomesForm(request).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'desired-outcomes-ids',
          formFields: ['desired-outcomes-ids'],
          message: 'Select desired outcomes',
        })
      })
    })
  })
})
