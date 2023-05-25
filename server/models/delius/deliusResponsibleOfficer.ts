export interface DeliusResponsibleOfficer {
  communityManager: Manager
  prisonManager?: Manager
}

interface Manager {
  code: string
  name: Name
  username: string
  email: string
  responsibleOfficer: boolean
  pdu: Pdu
}

interface Name {
  forename: string
  surname: string
}

interface Pdu {
  code: string
  description: string
}
