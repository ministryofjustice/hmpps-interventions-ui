import PresenterUtils from '../../../utils/presenterUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import PrimaryNavBarPresenter from '../../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../../models/loggedInUser'

export default class ReportingPresenter {
  constructor(
    private readonly loggedInUser: LoggedInUser,
    private readonly validationError: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly primaryNavBarPresenter = new PrimaryNavBarPresenter('Reporting', this.loggedInUser)

  readonly text = {
    title: 'Reporting',
    subtitle: 'Download service provider data as CSV documents.',
    hint: 'For example, 11 12 2020',
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly errorSummary = PresenterUtils.errorSummary(this.validationError)

  readonly fields = {
    fromDate: this.utils.dateValue(null, 'from-date', this.validationError),
    toDate: this.utils.dateValue(null, 'to-date', this.validationError),
  }
}
