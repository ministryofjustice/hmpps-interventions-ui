export default interface SessionFeedback {
  notifyProbationPractitioner: boolean | null
  notifyProbationPractitionerOfBehaviour: boolean | null
  notifyProbationPractitionerOfConcerns: boolean | null
  sessionSummary: string | null
  sessionResponse: string | null
  futureSessionPlans: string | null
  sessionConcerns: string | null
  sessionBehaviour: string | null
  behaviourDescription?: string | null
  late: boolean | null
  lateReason: string | null
  noSessionReasonType: NoSessionReasonType | null
  noSessionReasonPopAcceptable: string | null
  noSessionReasonPopUnacceptable: string | null
  noSessionReasonLogistics: string | null
  noAttendanceInformation: string | null
}

export enum NoSessionReasonType {
  POP_ACCEPTABLE = 'POP_ACCEPTABLE',
  POP_UNACCEPTABLE = 'POP_UNACCEPTABLE',
  LOGISTICS = 'LOGISTICS',
}
