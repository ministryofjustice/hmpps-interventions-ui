import { DraftReferral } from '../../services/interventionsService'

export default class DraftReferralsListPresenter {
  constructor(private readonly draftReferrals: DraftReferral[]) {}

  get orderedReferrals(): DraftReferralSummaryPresenter[] {
    return this.draftReferrals
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
      .map(referral => ({
        id: referral.id.slice(0, 8), // this is totally arbitrary, and probably meaningless to the user
        createdAt: new Date(referral.createdAt).toLocaleDateString('en-GB'),
        url: `/referrals/${referral.id}/form`,
      }))
  }

  readonly emptyText = 'You do not have any draft referrals at this moment.'
}

interface DraftReferralSummaryPresenter {
  id: string
  createdAt: string
  url: string
}
