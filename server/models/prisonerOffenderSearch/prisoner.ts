export default interface Prisoner {
  prisonId: string
  releaseDate: string | null
  confirmedReleaseDate: string | null
  nonDtoReleaseDate: string | null
  automaticReleaseDate: string | null
  postRecallReleaseDate: string | null
  conditionalReleaseDate: string | null
  actualParoleDate: string | null
  dischargeDate: string | null
}
