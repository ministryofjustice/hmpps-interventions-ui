import PresenterUtils from '../../../utils/presenterUtils'
import { FormValidationError } from '../../../utils/formValidationError'

export default class ReportingPresenter {
  constructor(
    private readonly validationError: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

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
