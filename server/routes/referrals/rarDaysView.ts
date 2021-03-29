import { InputArgs, RadiosArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import RarDaysPresenter from './rarDaysPresenter'

export default class RarDaysView {
  constructor(private readonly presenter: RarDaysPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private usingRarDaysRadiosArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'using-rar-days',
      name: 'using-rar-days',
      fieldset: {
        legend: {
          text: this.presenter.text.title,
          classes: 'govuk-fieldset__legend--xl',
          isPageHeading: true,
        },
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.presenter.fields.usingRarDays === true,
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: 'no',
          text: 'No',
          checked: this.presenter.fields.usingRarDays === false,
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.usingRarDays.errorMessage),
    }
  }

  private get maximumRarDaysInputArgs(): InputArgs {
    return {
      id: 'maximum-rar-days',
      name: 'maximum-rar-days',
      classes: 'govuk-input--width-4',
      label: {
        text: this.presenter.text.maximumRarDays.label,
      },
      value: this.presenter.fields.maximumRarDays,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.maximumRarDays.errorMessage),
      inputmode: 'numeric',
      pattern: '[0-9]*',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/rarDays',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        usingRarDaysRadiosArgs: this.usingRarDaysRadiosArgs.bind(this),
        maximumRarDaysInputArgs: this.maximumRarDaysInputArgs,
      },
    ]
  }
}
