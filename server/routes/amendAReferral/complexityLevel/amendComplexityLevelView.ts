import AmendComplexityLevelPresenter from './amendComplexityLevelPresenter'
import ViewUtils from '../../../utils/viewUtils'
import { RadiosArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'
import AmendComplexityLevelForm from './amendComplexityLevelForm'

export default class AmendComplexityLevelView {
  constructor(readonly presenter: AmendComplexityLevelPresenter) {}

  get radioButtonArgs(): RadiosArgs {
    return {
      classes: 'govuk-radios',
      idPrefix: 'complexity-level-id',
      name: 'complexity-level-id',
      fieldset: {
        legend: {
          text: this.presenter.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      items: this.presenter.complexityDescriptions.map(complexityDescription => {
        return {
          value: complexityDescription.value,
          text: complexityDescription.title,
          hint: {
            text: complexityDescription.hint,
          },
          checked: complexityDescription.checked,
        }
      }),
    }
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get textAreaArgs(): TextareaArgs {
    return {
      name: AmendComplexityLevelForm.amendComplexityReasonForChangeId,
      id: AmendComplexityLevelForm.amendComplexityReasonForChangeId,
      label: {
        text: this.presenter.reasonForChangeTitle,
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      hint: {
        text: 'For example, there are more desired outcomes or the person needs more support.',
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      value: this.presenter.fields.reasonForChange as string,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/complexityLevel',
      {
        presenter: this.presenter,
        radioButtonArgs: this.radioButtonArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        reasonForChangeInputArgs: this.textAreaArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}
