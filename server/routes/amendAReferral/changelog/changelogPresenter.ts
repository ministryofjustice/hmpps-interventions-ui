import Changelog from '../../../models/changelog'
import { ChangeLogViewSummary } from '../../../models/changeLogViewSummary'
import Intervention from '../../../models/intervention'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import utils from '../../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../../shared/referralOverviewPagePresenter'

export default class ChangelogPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly error: FormValidationError | null = null,
    readonly changelog: Changelog[],
    private referralId: string,
    private intervention: Intervention,
    public loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Changelog,
      referralId,
      loggedInUserType
    )
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly text = {
    title: `${utils.convertToTitleCase(this.intervention.contractType.name)}: change log`,
  }

  get changeLogs(): ChangeLogViewSummary[] {
    return this.changelog.map(log => {
      return {
        changeLog: log,
        changeLogUrl: `/${this.loggedInUserType}/referrals/${this.referralId}/changelog/${log.changelogId}/details`,
      }
    })
  }
}
