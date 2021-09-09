import { BackLinkArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import InitialAssessmentCheckAnswersPresenter from './initialAssessmentCheckAnswersPresenter'

export default class ScheduleAppointmentCheckAnswersView {
  constructor(private readonly presenter: InitialAssessmentCheckAnswersPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/scheduleAppointmentCheckAnswers',
      {
        presenter: this.presenter,
        backLinkArgs: this.backLinkArgs,
        summaryListArgs: this.summaryListArgs,
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
}
