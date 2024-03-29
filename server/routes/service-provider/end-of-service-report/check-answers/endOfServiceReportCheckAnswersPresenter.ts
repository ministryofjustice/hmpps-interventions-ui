import ServiceCategory from '../../../../models/serviceCategory'
import SentReferral from '../../../../models/sentReferral'
import EndOfServiceReport from '../../../../models/endOfServiceReport'
import EndOfServiceReportAnswersPresenter from '../../../shared/endOfServiceReportAnswersPresenter'
import EndOfServiceReportFormPresenter from '../endOfServiceReportFormPresenter'

export default class EndOfServiceReportCheckAnswersPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly endOfServiceReport: EndOfServiceReport,
    private readonly serviceCategories: ServiceCategory[],
    private readonly interventionTitle: string
  ) {}

  readonly formAction = `/service-provider/end-of-service-report/${this.endOfServiceReport.id}/submit`

  readonly text = {
    subTitle: 'Review the end of service report',
  }

  readonly formPagePresenter = new EndOfServiceReportFormPresenter(this.interventionTitle, this.referral)
    .checkAnswersPage

  readonly answersPresenter = new EndOfServiceReportAnswersPresenter(
    this.referral,
    this.endOfServiceReport,
    this.serviceCategories,
    true
  )
}
