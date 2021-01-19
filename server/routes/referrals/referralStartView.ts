import DraftReferralsListPresenter from './draftReferralsListPresenter'
import viewUtils from '../../utils/viewUtils'

export default class ReferralStartView {
  constructor(private readonly presenter: DraftReferralsListPresenter) {}

  private get tableArgs(): Record<string, unknown> {
    return {
      firstCellIsHeader: true,
      head: [{ text: 'ID' }, { text: 'Started on' }, { text: 'Link' }],
      rows: this.presenter.orderedReferrals.map(referral => {
        return [{ text: referral.id }, { text: referral.createdAt }, { html: `<a href="${referral.url}">Continue</a>` }]
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
