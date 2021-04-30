import EndOfServiceReport from '../../models/endOfServiceReport'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import PresenterUtils from '../../utils/presenterUtils'
import EndOfServiceReportFormPresenter from './endOfServiceReportFormPresenter'

export default class EndOfServiceReportFurtherInformationPresenter {
  constructor(
    private readonly endOfServiceReport: EndOfServiceReport,
    private readonly serviceCategory: ServiceCategory,
    private readonly referral: SentReferral,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    subTitle: 'Would you like to give any additional information about this intervention (optional)?',
  }

  readonly formPagePresenter = new EndOfServiceReportFormPresenter(this.serviceCategory, this.referral)
    .furtherInformationPage

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    furtherInformation: {
      value: this.utils.stringValue(this.endOfServiceReport.furtherInformation, 'further-information'),
    },
  }
}
