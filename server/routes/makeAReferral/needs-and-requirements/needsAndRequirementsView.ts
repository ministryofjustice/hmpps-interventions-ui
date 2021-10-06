import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'
import ViewUtils from '../../../utils/viewUtils'
import { InputArgs, RadiosArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'

export default class NeedsAndRequirementsView {
  constructor(private readonly presenter: NeedsAndRequirementsPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get additionalNeedsInformationTextareaArgs(): TextareaArgs {
    return {
      name: 'additional-needs-information',
      id: 'additional-needs-information',
      label: {
        text: this.presenter.text.additionalNeedsInformation.label,
        classes: 'govuk-label--s',
      },
      value: this.presenter.fields.additionalNeedsInformation,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.additionalNeedsInformation.errorMessage),
    }
  }

  private get accessibilityNeedsTextareaArgs(): TextareaArgs {
    return {
      name: 'accessibility-needs',
      id: 'accessibility-needs',
      label: {
        text: this.presenter.text.accessibilityNeeds.label,
        classes: 'govuk-label--s',
      },
      hint: {
        text: this.presenter.text.accessibilityNeeds.hint,
      },
      value: this.presenter.fields.accessibilityNeeds,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.accessibilityNeeds.errorMessage),
    }
  }

  private interpreterRadiosArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'needs-interpreter',
      name: 'needs-interpreter',
      fieldset: {
        legend: {
          text: this.presenter.text.needsInterpreter.label,
          classes: 'govuk-fieldset__legend--s',
        },
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.presenter.fields.needsInterpreter === true,
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: 'no',
          text: 'No',
          checked: this.presenter.fields.needsInterpreter === false,
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.needsInterpreter.errorMessage),
    }
  }

  private get interpreterLanguageInputArgs(): InputArgs {
    return {
      id: 'interpreter-language',
      name: 'interpreter-language',
      classes: 'govuk-!-width-one-third',
      label: {
        text: this.presenter.text.interpreterLanguage.label,
      },
      value: this.presenter.fields.interpreterLanguage,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.interpreterLanguage.errorMessage),
    }
  }

  private responsibilitiesRadiosArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'has-additional-responsibilities',
      name: 'has-additional-responsibilities',
      fieldset: {
        legend: {
          text: this.presenter.text.hasAdditionalResponsibilities.label,
          classes: 'govuk-fieldset__legend--s',
        },
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
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.hasAdditionalResponsibilities.errorMessage),
    }
  }

  private get whenUnavailableTextareaArgs(): InputArgs {
    return {
      id: 'when-unavailable',
      name: 'when-unavailable',
      label: {
        text: this.presenter.text.whenUnavailable.label,
      },
      value: this.presenter.fields.whenUnavailable,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.whenUnavailable.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/needsAndRequirements',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        additionalNeedsInformationTextareaArgs: this.additionalNeedsInformationTextareaArgs,
        accessibilityNeedsTextareaArgs: this.accessibilityNeedsTextareaArgs,
        interpreterRadiosArgs: this.interpreterRadiosArgs.bind(this),
        interpreterLanguageInputArgs: this.interpreterLanguageInputArgs,
        responsibilitiesRadiosArgs: this.responsibilitiesRadiosArgs.bind(this),
        whenUnavailableTextareaArgs: this.whenUnavailableTextareaArgs,
      },
    ]
  }
}
