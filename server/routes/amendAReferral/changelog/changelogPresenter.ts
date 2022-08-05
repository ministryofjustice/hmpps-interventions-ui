import Changelog from '../../../models/changelog'
import { ChangeLogViewSummary } from '../../../models/changeLogViewSummary'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ChangelogPresenter {
  constructor(private readonly error: FormValidationError | null = null, readonly changelog: Changelog[]) {}

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  get changeLogs(): ChangeLogViewSummary[] {
    return this.changelog.map(log => {
      return { changeLogUrl: '', changeLog: log }
    })
  }
}
