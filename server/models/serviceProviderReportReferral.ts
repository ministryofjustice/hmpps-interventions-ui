export interface ServiceProviderReportReferral {
  referralLink: string
  referralRef: string
  referralId: string
  contractId: string
  organisationId: string
  referringOfficerEmail: string
  caseworkerId: string
  serviceUserCRN: string
  dateReferralReceived: string
  dateSAABooked: string | null
  dateSAAAttended: string | null
  dateFirstActionPlanSubmitted: string | null
  dateOfFirstActionPlanApproval: string | null
  dateOfFirstAttendedSession: string | null
  outcomesToBeAchievedCount: number | null
  outcomesAchieved: number | null
  countOfSessionsExpected: number | null
  countOfSessionsAttended: number | null
  endRequestedByPPAt: string | null
  endRequestedByPPReason: string | null
  dateEOSRSubmitted: string | null
  concludedAt: string | null
}
