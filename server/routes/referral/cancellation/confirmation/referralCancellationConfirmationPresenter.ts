import SentReferral from '../../../../models/sentReferral'
import PresenterUtils from '../../../../utils/presenterUtils'
import { SummaryListItem } from '../../../../utils/summaryList'
import utils from '../../../../utils/utils'
import Intervention from '../../../../models/intervention'

export default class ReferralCancellationConfirmationPresenter {
  constructor(private readonly referral: SentReferral, private readonly intervention: Intervention) {}

  readonly text = {
    confirmationText: 'This referral has been cancelled',
    headingText: 'What you need to do next',
    whatHappensNextText: `You need to contact the service provider outside the service to let them know about the change.`,
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
