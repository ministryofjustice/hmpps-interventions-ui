import { TextareaArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import PostSessionBehaviourFeedbackPresenter from './postSessionBehaviourFeedbackPresenter'

export default class PostSessionBehaviourFeedbackView {
  constructor(private readonly presenter: PostSessionBehaviourFeedbackPresenter) {}

  private get textAreaArgs(): TextareaArgs {
    return {
      name: 'behaviour-description',
      id: 'behaviour-description',
      label: {
        text: this.presenter.text.behaviourDescription.question,
        classes: 'govuk-label--m govuk-!-margin-bottom-4',
        isPageHeading: false,
      },
      hint: {
        text: this.presenter.text.behaviourDescription.hint,
      },
      value: this.presenter.fields.behaviourDescriptionValue,
    }
  }

  private get radioButtonArgs(): Record<string, unknown> {
    return {
      classes: 'govuk-radios',
      idPrefix: 'notify-probation-practitioner',
      name: 'notify-probation-practitioner',
      fieldset: {
        legend: {
          html: `<h2 class=govuk-fieldset__legend--m>${ViewUtils.escape(
            this.presenter.text.notifyProbationPractitioner.question
          )}</h2><p class="govuk-body--m">${ViewUtils.escape(
            this.presenter.text.notifyProbationPractitioner.explanation
          )}</p>`,
          isPageHeading: false,
        },
      },
      hint: {
        text: this.presenter.text.notifyProbationPractitioner.hint,
      },
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.presenter.fields.notifyProbationPractitioner === true,
        },
        {
          value: 'no',
          text: 'No',
          checked: this.presenter.fields.notifyProbationPractitioner === false,
        },
      ],
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/postSessionBehaviourFeedback',
      {
        presenter: this.presenter,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserBannerPresenter.serviceUserBannerArgs,
        textAreaArgs: this.textAreaArgs,
        radioButtonArgs: this.radioButtonArgs,
      },
    ]
  }
}
