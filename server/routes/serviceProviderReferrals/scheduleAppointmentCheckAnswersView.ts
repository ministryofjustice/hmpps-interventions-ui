import { BackLinkArgs, NotificationBannerArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import DeliverySessionSchedulingCheckAnswersPresenter from '../appointments/deliverySessions/deliverySessionSchedulingCheckAnswersPresenter'
import ActionPlanSessionCheckAnswersPresenter from './actionPlanSessionCheckAnswersPresenter'
import InitialAssessmentCheckAnswersPresenter from './initialAssessmentCheckAnswersPresenter'

export default class ScheduleAppointmentCheckAnswersView {
  constructor(
    private readonly presenter:
      | InitialAssessmentCheckAnswersPresenter
      | ActionPlanSessionCheckAnswersPresenter // deprecated
      | DeliverySessionSchedulingCheckAnswersPresenter
  ) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/scheduleAppointmentCheckAnswers',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        summaryListArgs: this.summaryListArgs,
        notificationBannerArgs: this.notificationBannerArgs,
      },
    ]
  }

  private get backLinkArgs(): BackLinkArgs {
    return {
      text: 'Back',
      href: this.presenter.backLinkHref,
    }
  }

  private get summaryListArgs(): SummaryListArgs {
    return ViewUtils.summaryListArgs(this.presenter.summary)
  }

  private get notificationBannerArgs(): NotificationBannerArgs | null {
    return this.presenter.pastAppointment
      ? {
          titleText: 'Important',
          html: `<b>You've chosen a data and time in the past</b>
        <br>
        <p>
           If you're logging a session that's already happened you can add the attendance feedback next.
        </p>
        <p>
            If you meant to set a time in the future, go back and change the date and time.
        </p>`,
        }
      : null
  }
}
