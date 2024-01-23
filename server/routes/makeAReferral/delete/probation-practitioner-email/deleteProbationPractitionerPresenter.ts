import PresenterUtils from '../../../../utils/presenterUtils'

export default class DeleteProbationPractitionerPresenter {
  backLinkUrl: string

  constructor(
    private readonly id: string,
    private readonly crn: string,
    private readonly ndeliusPPEmailAddress: string | null | undefined,
    private readonly firstName: string | null = null,
    private readonly lastName: string | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.backLinkUrl = `/referrals/${id}/confirm-probation-practitioner-details`
  }

  readonly text = {
    title: 'Are you sure you want to delete the probation practitioner email address?',
    label: `${this.firstName} ${this.lastName} (CRN: ${this.crn})`,
    inputHeading: 'Full name',
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    ndeliusPPEmailAddress: this.utils.stringValue(this.ndeliusPPEmailAddress!, 'delius-probation-practitioner-email'),
  }
}
