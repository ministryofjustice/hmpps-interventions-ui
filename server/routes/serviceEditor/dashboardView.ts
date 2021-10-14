import ViewUtils from '../../utils/viewUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../models/loggedInUser'

export default class DashboardView {
  constructor(private readonly loggedInUser: LoggedInUser) {}

  private primaryNavBarPresenter = new PrimaryNavBarPresenter('My services', this.loggedInUser)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceEditor/dashboard',
      {
        primaryNavArgs: ViewUtils.primaryNav(this.primaryNavBarPresenter.items),
      },
    ]
  }
}
