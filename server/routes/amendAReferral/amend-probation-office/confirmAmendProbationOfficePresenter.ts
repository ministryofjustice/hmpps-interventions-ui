export default class ConfirmAmendProbationOfficePresenter {
  readonly backLinkUrl: string

  readonly amendProbationOfficeUrl: string

  readonly withdrawalUrl: string

  constructor(
    private readonly referralId: string,
    private readonly urlPath: string,
    readonly firstName: string | null = null,
    readonly lastName: string | null = null,
    readonly ppPdu: string | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${referralId}/details`
    this.amendProbationOfficeUrl = `/probation-practitioner/referrals/${referralId}/${urlPath}`
    this.withdrawalUrl = `/probation-practitioner/referrals/${referralId}/withdrawal/start`
  }
}
