export interface DeliusResponsibleOfficer {
  communityManager: Manager
  prisonManager?: Manager
}

interface Manager {
  code: string
  name: Name
  username?: string | null
  email?: string | null
  telephoneNumber?: string | null
  responsibleOfficer: boolean
  pdu: Pdu
  team: Team
  unallocated: boolean
}

interface Name {
  forename: string
  surname: string
}

interface Pdu {
  code: string
  description: string
}

interface Team {
  code: string
  description: string
  email?: string | null
  telephoneNumber?: string | null
}
