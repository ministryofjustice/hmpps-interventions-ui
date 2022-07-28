import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ChangelogPresenter {
  constructor(private readonly error: FormValidationError | null = null) {}

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly title = `What's the reason for changing the complexity level?`
}
