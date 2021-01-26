import ReferralStartPresenter from './referralStartPresenter'
import viewUtils from '../../utils/viewUtils'

export default class ReferralStartView {
  constructor(private readonly presenter: ReferralStartPresenter) {}

  private get tableArgs(): Record<string, unknown> {
    return {
      firstCellIsHeader: true,
      head: [{ text: 'Service User' }, { text: 'Started on' }],
      rows: this.presenter.orderedReferrals.map(referral => {
        return [{ html: `<a href="${referral.url}">${referral.serviceUserFullName}</a>` }, { text: referral.createdAt }]
      }),
    }
  }

  private crnInputArgs(): Record<string, unknown> {
    return {
      id: 'service-user-crn',
      name: 'service-user-crn',
      label: {
        text: 'Service User CRN',
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      autocomplete: 'off',
      errorMessage: viewUtils.govukErrorMessage(this.presenter.text.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/start',
      {
        presenter: this.presenter,
        tableArgs: this.tableArgs,
        crnInputArgs: this.crnInputArgs(),
      },
    ]
  }
}
