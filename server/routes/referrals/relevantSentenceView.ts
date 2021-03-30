import { RadiosArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import RelevantSentencePresenter from './relevantSentencePresenter'

export default class RelevantSentenceView {
  constructor(readonly presenter: RelevantSentencePresenter) {}

  get radioButtonArgs(): RadiosArgs {
    return {
      classes: 'govuk-radios',
      idPrefix: 'relevant-sentence-id',
      name: 'relevant-sentence-id',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl govuk-!-margin-bottom-8',
        },
      },
      items: this.presenter.relevantSentenceFields.map(relevantSentence => {
        return {
          value: relevantSentence.value.toString(),
          html: `${ViewUtils.escape(relevantSentence.category)}<br>Subcategory: ${ViewUtils.escape(
            relevantSentence.subcategory
          )}<br>End of sentence date: ${ViewUtils.escape(relevantSentence.endOfSentenceDate)}`,
          checked: relevantSentence.checked,
        }
      }),
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/relevantSentence',
      {
        presenter: this.presenter,
        radioButtonArgs: this.radioButtonArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}
