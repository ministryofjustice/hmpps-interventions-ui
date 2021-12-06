import { SummaryListItem } from '../../../../utils/summaryList'
import PresenterUtils from '../../../../utils/presenterUtils'
import utils from '../../../../utils/utils'
import SentReferral from '../../../../models/sentReferral'
import Intervention from '../../../../models/intervention'

export default class AddCaseNoteConfirmationPresenter {
  constructor(
    private referral: SentReferral,
    private intervention: Intervention,
    public loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {}

  caseNotesHref = `/${this.loggedInUserType}/referrals/${this.referral.id}/case-notes`

  text = {
    whatHappensNext: `The case note will be available to view by the service user's ${this.loggedInUserTypeText}.`,
  }

  readonly serviceUserSummary: SummaryListItem[] = [
    {
      key: 'Name',
      lines: [PresenterUtils.fullName(this.referral.referral.serviceUser)],
    },
    {
      key: 'Referral number',
      lines: [this.referral.referenceNumber],
    },
    {
      key: 'Service type',
      lines: [utils.convertToProperCase(this.intervention.contractType.name)],
    },
  ]

  private get loggedInUserTypeText(): string {
    if (this.loggedInUserType === 'service-provider') {
      return 'service provider'
    }
    return 'probation practitioner'
  }
}
