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
    whatHappensNext: `The ${this.targetUserType} can now view this case note in the service.`,
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

  private get targetUserType(): string {
    return this.loggedInUserType === 'service-provider' ? 'probation practitioner' : 'service provider'
  }
}
