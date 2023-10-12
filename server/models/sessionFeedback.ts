export default interface SessionFeedback {
  notifyProbationPractitioner: boolean | null
  sessionSummary: string | null
  sessionResponse: string | null
  futureSessionPlans: string | null
  sessionConcerns: string | null
  behaviourDescription?: string | null
  late: boolean | null
  lateReason: string | null
}
