import SentReferral from '../../models/sentReferral'
import PresenterUtils from '../../utils/presenterUtils'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'
import Intervention from '../../models/intervention'

export default class ReferralCancellationConfirmationPresenter {
  constructor(private readonly referral: SentReferral, private readonly intervention: Intervention) {}

  readonly text = {
    confirmationText: 'This referral has been cancelled',
    whatHappensNextText:
      "Service provider will be notified about the cancellation. You don't have to do anything else.",
  }

  readonly myCasesHref = '/probation-practitioner/dashboard'

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
      key: 'Type of referral',
      lines: [utils.convertToProperCase(this.intervention.contractType.name)],
    },
  ]
}
