import Changelog from '../../../models/changelog'
import { ChangeLogViewSummary } from '../../../models/changeLogViewSummary'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../../shared/referralOverviewPagePresenter'

export default class ChangelogPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly error: FormValidationError | null = null,
    readonly changelog: Changelog[],
    private referralId: string,
    public loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Changelog,
      referralId,
      loggedInUserType
    )
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  get changeLogs(): ChangeLogViewSummary[] {
    return this.changelog.map(log => {
      return {
        changeLog: log,
        changeLogUrl: `/probation-practitioner/referrals/${this.referralId}/changelog/${log.changelogId}/details`,
      }
    })
  }
}
