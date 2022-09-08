import ViewUtils from '../../../utils/viewUtils'
import {
  BackLinkArgs,
  InputArgs,
  NotificationBannerArgs,
  RadiosArgs,
  TextareaArgs,
} from '../../../utils/govukFrontendTypes'
import IntepreterRequiredPresenter from './intepreterRequiredPresenter'
import AmendNeedsAndRequirementsIntepreterForm from './amendNeedsAndRequirementsIntepreterForm'

export default class IntepreterRequiredView {
  constructor(private readonly presenter: IntepreterRequiredPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get textAreaArgs(): TextareaArgs {
    return {
      name: AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId,
      id: AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId,
      label: {
        text: this.presenter.text.reasonForChange.title,
        classes: 'govuk-label--l',
        isPageHeading: false,
      },
      hint: {
        text: this.presenter.text.reasonForChange.hint,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.reasonForChangeError),
      // value: this.presenter.fields.reasonForChange as string,
    }
  }

  get notificationBannerArgs(): NotificationBannerArgs | null {
    const html = `<hr class="govuk-section-break govuk-section-break--s">
          <p>
          You have not made any changes to whether an interpreter is needed.If you want to leave it unchanged, <a href= ${this.presenter.backLinkUrl}>cancel and go back</a>.
          </p>`
    return this.presenter.showNoChangesBanner
      ? {
          titleText: 'Important',
          html,
        }
      : null
  }

  private intepreterNeedsRadio(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'needs-interpreter',
      name: 'needs-interpreter',
      fieldset: {
        legend: {
          text: this.presenter.text.requirements.title,
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      hint: {
        text: this.presenter.text.requirements.needsInterpreter.hint,
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
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.requirements.needsInterpreter.errorMessage),
    }
  }

  private get intepreterLanguage(): InputArgs {
    return {
      id: 'interpreter-language',
      name: 'interpreter-language',
      label: {
        text: this.presenter.text.requirements.interpreterLanguage.label,
      },
      value: this.presenter.fields.interpreterLanguage,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.interpreterLanguageError),
    }
  }

  private readonly backLinkArgs: BackLinkArgs = {
    text: 'Back',
    href: this.presenter.backLinkUrl,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/intepreterRequired',
      {
        presenter: this.presenter,
        reasonForChangeInputArgs: this.textAreaArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: this.presenter.backLinkUrl,
        intepreterNeedsRadioArgs: this.intepreterNeedsRadio.bind(this),
        needsInterpreterArgs: this.intepreterLanguage,
        notificationBannerArgs: this.notificationBannerArgs,
      },
    ]
  }
}
