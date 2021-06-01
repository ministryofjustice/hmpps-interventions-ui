import EndOfServiceReport from '../../models/endOfServiceReport'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import EndOfServiceReportAnswersPresenter from '../shared/endOfServiceReportAnswersPresenter'
import PresenterUtils from '../../utils/presenterUtils'

export default class EndOfServiceReportPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly endOfServiceReport: EndOfServiceReport,
    private readonly serviceCategories: ServiceCategory[]
  ) {}

  readonly text = {
    introduction: `The service provider has created an end of service report for ${PresenterUtils.fullName(
      this.referral.referral.serviceUser
    )}’s intervention. Please view the following end of service report.`,
  }

  readonly answersPresenter = new EndOfServiceReportAnswersPresenter(
    this.referral,
    this.endOfServiceReport,
    this.serviceCategories,
    false
  )
}
