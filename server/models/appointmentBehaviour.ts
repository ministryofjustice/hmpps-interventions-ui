export default interface AppointmentBehaviour {
  behaviourDescription: string | null //deprecated
  notifyProbationPractitioner: boolean | null
  sessionSummary: string | null
  sessionResponse: string | null
  sessionConcerns: string | null
}
