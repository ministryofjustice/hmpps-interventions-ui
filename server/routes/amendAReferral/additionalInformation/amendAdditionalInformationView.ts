import { TextareaArgs, NotificationBannerArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import AmendAdditionalInformationForm from './amendAdditionalInformationForm'
import AmendAdditionalInformationPresenter from './amendAdditionalInformationPresenter'

export default class AmendAdditionalInformationView {
  constructor(readonly presenter: AmendAdditionalInformationPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get additionalInformationTextAreaArgs(): TextareaArgs {
    return {
      name: AmendAdditionalInformationForm.additionalInformationId,
      id: AmendAdditionalInformationForm.additionalInformationId,
      label: {
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      value: this.presenter.additionalInformationField as string,
    }
  }

  private get reasonForChangeTextAreaArgs(): TextareaArgs {
    return {
      name: AmendAdditionalInformationForm.reasonForChangeId,
      id: AmendAdditionalInformationForm.reasonForChangeId,
      label: {
        text: this.presenter.reasonForChangeTitle,
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      hint: {
        text: this.presenter.reasonForChangeHintText,
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      value: this.presenter.fields.reasonForChange as string,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/additionalInformation',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        additionalInformationTextAreaArgs: this.additionalInformationTextAreaArgs,
        reasonForChangeInputArgs: this.reasonForChangeTextAreaArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        notificationBannerArgs: this.notificationBannerArgs,
      },
    ]
  }

  get notificationBannerArgs(): NotificationBannerArgs | null {
    const html = `<hr class="govuk-section-break govuk-section-break--s">
          <p>
          You have not made any changes to additional information. If you want to leave the additional information as it is, <a href= ${this.presenter.backLinkUrl}>cancel and go back</a>.
          </p>`
    return this.presenter.showNoChangesBanner
      ? {
          titleText: 'Important',
          html,
        }
      : null
  }
}
