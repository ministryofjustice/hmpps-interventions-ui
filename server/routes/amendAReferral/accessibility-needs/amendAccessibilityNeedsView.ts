import AccessibilityNeedsForm from './amendAccessibilityNeedsForm'
import AccessibilityNeedsPresenter from './amendAccessibilityNeedsPresenter'
import ViewUtils from '../../../utils/viewUtils'
import { TextareaArgs, NotificationBannerArgs } from '../../../utils/govukFrontendTypes'

export default class AccessibilityNeedsView {
  constructor(private readonly presenter: AccessibilityNeedsPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get accessibilityNeedsTextareaArgs(): TextareaArgs {
    return {
      name: AccessibilityNeedsForm.accessibilityNeeds,
      id: AccessibilityNeedsForm.accessibilityNeeds,
      label: {
        text: this.presenter.text.accessibilityNeeds.label,
        classes: 'govuk-label--l',
      },
      hint: {
        text: this.presenter.text.accessibilityNeeds.hint,
      },
      value: this.presenter.fields.accessibilityNeeds,
    }
  }

  private get textAreaArgs(): TextareaArgs {
    return {
      name: AccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId,
      id: AccessibilityNeedsForm.amendAccessibilityNeedsReasonForChangeId,
      label: {
        text: this.presenter.reasonTitle,
        classes: 'govuk-label--l',
        isPageHeading: false,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.reasonForChangeErrorMessage),
      value: this.presenter.fields.reasonForChange as string,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/accessibilityNeeds.njk',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        reasonForChangeInputArgs: this.textAreaArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        accessibilityNeedsTextareaArgs: this.accessibilityNeedsTextareaArgs,
        notificationBannerArgs: this.notificationBannerArgs,
      },
    ]
  }

  get notificationBannerArgs(): NotificationBannerArgs | null {
    const html = `<hr class="govuk-section-break govuk-section-break--s">
          <p>
          You have not made any changes to mobility, disability or accessibility needs. If you want to leave the desired outcomes as they are, <a href= ${this.presenter.backLinkUrl}>cancel and go back</a>.
          </p>`
    return this.presenter.showNoChangesBanner
      ? {
          titleText: 'Important',
          html,
        }
      : null
  }
}
