import DashboardPresenter from './dashboardPresenter'
import loggedInUser from '../../../testutils/factories/loggedInUser'
import intervention from '../../../testutils/factories/intervention'

describe('DashboardPresenter', () => {
  describe('serviceTitlesAndSummaries', () => {
    it('contains an entry for each intervention', () => {
      const user = loggedInUser.crsServiceProviderUser().build()
      const interventions = [
        intervention.build({ title: 'Better living' }),
        intervention.build({ title: 'Better housing' }),
      ]
      const presenter = new DashboardPresenter(user, interventions)

      expect(presenter.serviceTitlesAndSummaries.length).toEqual(2)
      expect(presenter.serviceTitlesAndSummaries[0][0]).toEqual('Better living')
      expect(presenter.serviceTitlesAndSummaries[1][0]).toEqual('Better housing')

      expect(presenter.serviceTitlesAndSummaries[0][1]).toContainEqual({
        key: 'Type',
        lines: ['Commissioned Rehabilitative Services (CRS)'],
      })
    })
  })
})
