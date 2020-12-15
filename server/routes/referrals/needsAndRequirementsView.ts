import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'
import ViewUtils from '../../utils/viewUtils'

export default class NeedsAndRequirementsView {
  constructor(private readonly presenter: NeedsAndRequirementsPresenter) {}

  private get errorSummaryArgs() {
    if (!this.presenter.errorSummary) {
      return null
    }

    return {
      titleText: 'There is a problem',
      errorList: this.presenter.errorSummary.map(error => ({ text: error.message, href: `#${error.field}` })),
    }
  }

  private get summaryListArgs() {
    return {
      rows: this.presenter.summary.map(item => {
        return {
          key: {
            text: item.key,
          },
          value: (() => {
            if (item.isList) {
              const html = `<ul class="govuk-list">${item.lines
                .map(line => `<li>${ViewUtils.escape(line)}</li>`)
                .join('\n')}</ul>`
              return { html }
            }
            if (item.lines.length > 1) {
              const html = item.lines.map(line => `<p class="govuk-body">${ViewUtils.escape(line)}</p>`).join('\n')
              return { html }
            }
            return { text: item.lines[0] || '' }
          })(),
        }
      }),
    }
  }

  private get additionalNeedsInformationTextareaArgs() {
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

  private get accessibilityNeedsTextareaArgs() {
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

  private interpreterRadiosArgs(yesHtml: string) {
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

  private get interpreterLanguageInputArgs() {
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

  private responsibilitiesRadiosArgs(yesHtml: string) {
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

  private get whenUnavailableInputArgs() {
    return {
      id: 'when-unavailable',
      name: 'when-unavailable',
      classes: 'govuk-!-width-one-third',
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
        summaryListArgs: this.summaryListArgs,
        additionalNeedsInformationTextareaArgs: this.additionalNeedsInformationTextareaArgs,
        accessibilityNeedsTextareaArgs: this.accessibilityNeedsTextareaArgs,
        interpreterRadiosArgs: this.interpreterRadiosArgs.bind(this),
        interpreterLanguageInputArgs: this.interpreterLanguageInputArgs,
        responsibilitiesRadiosArgs: this.responsibilitiesRadiosArgs.bind(this),
        whenUnavailableInputArgs: this.whenUnavailableInputArgs,
      },
    ]
  }
}
