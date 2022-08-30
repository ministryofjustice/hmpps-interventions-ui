import ViewUtils from '../../../utils/viewUtils'
import { InputArgs, RadiosArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'
import AmendEmploymentResponsibilitiesPresenter from './amendEmploymentResponsibilitiesPresenter'
import AmendEmploymentResponsibilitiesForm from './amendEmploymentResponsibilitiesForm'

export default class AmendEmploymentResponsibilitiesView {
  constructor(private readonly presenter: AmendEmploymentResponsibilitiesPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get textAreaArgs(): TextareaArgs {
    return {
      name: AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId,
      id: AmendEmploymentResponsibilitiesForm.amendEmploymentResponsibilitiesReasonForChangeId,
      label: {
        text: this.presenter.text.reasonForChange.title,
        classes: 'govuk-label--l',
        isPageHeading: false,
      },
      hint: {
        text: this.presenter.text.reasonForChange.hint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      // value: this.presenter.fields.reasonForChange as string,
    }
  }

  private responsibilitiesRadiosArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'has-additional-responsibilities',
      name: 'has-additional-responsibilities',
      fieldset: {
        legend: {
          text: this.presenter.text.responsibilities.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      hint: {
        text: this.presenter.text.responsibilities.hasAdditionalResponsibilities.hint,
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.presenter.fields.hasAdditionalResponsibilities === true,
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: 'no',
          text: 'No',
          checked: this.presenter.fields.hasAdditionalResponsibilities === false,
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(
        this.presenter.text.responsibilities.hasAdditionalResponsibilities.errorMessage
      ),
    }
  }

  private get whenUnavailableTextareaArgs(): InputArgs {
    return {
      id: 'when-unavailable',
      name: 'when-unavailable',
      label: {
        text: this.presenter.text.responsibilities.whenUnavailable.label,
      },
      value: this.presenter.fields.whenUnavailable,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.responsibilities.whenUnavailable.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/employmentResponsibilities',
      {
        presenter: this.presenter,
        reasonForChangeInputArgs: this.textAreaArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        responsibilitiesRadiosArgs: this.responsibilitiesRadiosArgs.bind(this),
        whenUnavailableTextareaArgs: this.whenUnavailableTextareaArgs,
      },
    ]
  }
}
