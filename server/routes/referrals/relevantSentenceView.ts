import ViewUtils from '../../utils/viewUtils'
import RelevantSentencePresenter from './relevantSentencePresenter'

export default class RelevantSentenceView {
  constructor(readonly presenter: RelevantSentencePresenter) {}

  get radioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'relevant-sentence-id',
      name: 'relevant-sentence-id',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      items: this.presenter.relevantSentenceFields.map(relevantSentence => {
        return {
          value: relevantSentence.value,
          html: `${ViewUtils.escape(relevantSentence.category)}<br>Subcategory: ${ViewUtils.escape(
            relevantSentence.subcategory
          )}<br>End of sentence date: ${ViewUtils.escape(relevantSentence.endOfSentenceDate)}`,
          checked: relevantSentence.checked,
        }
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/relevantSentence',
      {
        presenter: this.presenter,
        radioButtonArgs: this.radioButtonArgs,
      },
    ]
  }
}
