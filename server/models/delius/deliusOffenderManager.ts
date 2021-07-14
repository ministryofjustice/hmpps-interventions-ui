export interface DeliusOffenderManager {
  isResponsibleOfficer: boolean
  staff?: {
    forenames?: string | null
    surname?: string | null
    email?: string | null
    phoneNumber?: string | null
  }
}
