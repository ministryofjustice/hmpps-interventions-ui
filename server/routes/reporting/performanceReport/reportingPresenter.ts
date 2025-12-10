import PresenterUtils from '../../../utils/presenterUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import PrimaryNavBarPresenter from '../../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../../models/loggedInUser'

export default class ReportingPresenter {
  private formError: FormValidationError | null

  constructor(
    private readonly loggedInUser: LoggedInUser,
    private readonly validationError: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.formError = validationError
  }

  readonly primaryNavBarPresenter = new PrimaryNavBarPresenter('Reporting', this.loggedInUser)

  readonly text = {
    title: 'Reporting',
    subtitle: "Download a CSV of case data from this service. You can download up to 6 months' data per search.",
    hint: 'For example, 01 08 2023',
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly errorSummary = PresenterUtils.errorSummary(this.validationError)

  readonly fields = {
    fromDate: this.utils.dateValue(null, 'from-date', this.validationError),
    toDate: this.utils.dateValue(null, 'to-date', this.validationError),
  }
}
