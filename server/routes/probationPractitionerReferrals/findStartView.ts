import { TableArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import FindStartPresenter from './findStartPresenter'

export default class FindStartView {
  constructor(private readonly presenter: FindStartPresenter) {}

  private get tableArgs(): TableArgs {
    return {
      firstCellIsHeader: true,
      head: [{ text: 'Service User' }, { text: 'Started on' }],
      rows: this.presenter.orderedReferrals.map(referral => {
        return [
          { html: `<a href="${ViewUtils.escape(referral.url)}">${ViewUtils.escape(referral.serviceUserFullName)}</a>` },
          { text: referral.createdAt },
        ]
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/findStart',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
        primaryNavArgs: ViewUtils.primaryNav(this.presenter.navItemsPresenter.items),
      },
    ]
  }
}
