import SelectExpectedReleaseDateForm from './selectExpectedReleaseDateForm'
import TestUtils from '../../../../../testutils/testUtils'

describe(SelectExpectedReleaseDateForm, () => {
  describe('data', () => {
    describe('when the expected release date from prisoner search is selected / confirmed', () => {
      it('returns a paramsForUpdate with the expected release date', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'confirm',
        })
        const releaseDate = '01-01-2025'
        const data = await new SelectExpectedReleaseDateForm(request, releaseDate).data()

        expect(data.paramsForUpdate?.hasExpectedReleaseDate).toEqual(true)
        expect(data.paramsForUpdate?.expectedReleaseDate).toEqual(releaseDate)
      })
    })
  })
})
