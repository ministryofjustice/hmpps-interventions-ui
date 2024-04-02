import SelectExpectedReleaseDatePresenter from './selectExpectedReleaseDatePresenter'
import ViewUtils from '../../../../utils/viewUtils'
import { RadiosArgs } from '../../../../utils/govukFrontendTypes'

export default class SelectExpectedReleaseDateView {
  constructor(private readonly presenter: SelectExpectedReleaseDatePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private expectedReleaseDateRadioArgs(): RadiosArgs {
    return {
      idPrefix: 'expected-release-date',
      name: 'expected-release-date',
      items: [
        {
          value: 'confirm',
          html: `Expected release date <strong>&emsp;${
            this.presenter.fields.releaseDate ? `${this.presenter.fields.releaseDate}` : null
          }</strong>`,
          checked: this.presenter.fields.hasMatchingReleaseDate === true,
        },
        {
          value: 'change',
          text: 'Choose a different date',
          checked: this.presenter.fields.hasMatchingReleaseDate === false,
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.fields.expectedReleaseDate.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/selectExpectedReleaseDate',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        expectedReleaseDateRadioArgs: this.expectedReleaseDateRadioArgs.bind(this),
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
