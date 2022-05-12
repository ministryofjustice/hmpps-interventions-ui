import DraftReferral from '../../models/draftReferral'
import PresenterUtils from '../../utils/presenterUtils'
import DateUtils from '../../utils/dateUtils'
import PrimaryNavBarPresenter from '../shared/primaryNavBar/primaryNavBarPresenter'
import LoggedInUser from '../../models/loggedInUser'

export default class FindStartPresenter {
  constructor(
    private readonly draftReferrals: DraftReferral[],
    private readonly downloadPaths: { xlsx: string },
    private readonly downloadFileSize: { bytes: number },
    private readonly loggedInUser: LoggedInUser
  ) {}

  readonly navItemsPresenter = new PrimaryNavBarPresenter('Find interventions', this.loggedInUser)

  get orderedReferrals(): DraftReferralSummaryPresenter[] {
    return this.draftReferrals
      .sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1))
      .map(referral => ({
        serviceUserFullName: PresenterUtils.fullName(referral.serviceUser),
        createdAt: DateUtils.formattedDate(referral.createdAt, { month: 'short' }),
        url: `/referrals/${referral.id}/form`,
      }))
  }

  get fileInformation(): string {
    const roundedKilobyteSize = (this.downloadFileSize.bytes / 1024).toFixed(1)
    return `${this.extension(this.downloadPaths.xlsx).toUpperCase()}, ${roundedKilobyteSize}KB`
  }

  readonly structuredInterventionsDownloadHrefs = {
    xlsx: `/${this.downloadPaths.xlsx}`,
  }

  readonly text = {
    noDraftReferrals: 'You do not have any draft referrals at this moment.',
  }

  private extension(filepath: string): string {
    const extension = filepath.split('.').pop()

    if (!extension) {
      throw new Error('No extension found')
    }

    return extension
  }
}

interface DraftReferralSummaryPresenter {
  serviceUserFullName: string
  createdAt: string
  url: string
}
