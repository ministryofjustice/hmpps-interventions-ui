export default class ConfirmAmendProbationOfficePresenter {
  readonly backLinkUrl: string

  readonly amendProbationOfficeUrl: string

  readonly withdrawalUrl: string

  readonly confirmPduQuestionText: string

  constructor(
    private readonly referralId: string,
    private readonly urlPath: string,
    private readonly referralWithoutCom: boolean | null,
    readonly firstName: string | null = null,
    readonly lastName: string | null = null,
    readonly ppPdu: string | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${referralId}/details`
    this.amendProbationOfficeUrl = `/probation-practitioner/referrals/${referralId}/${urlPath}`
    this.withdrawalUrl = `/probation-practitioner/referrals/${referralId}/withdrawal/start`
    this.confirmPduQuestionText = `${
      referralWithoutCom
        ? 'Can you confirm that the new probation office is within the current PDU?'
        : `Can you confirm that the new probation office is within the current PDU - ${ppPdu}?`
    }`
  }
}
