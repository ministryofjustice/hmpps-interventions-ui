export interface DeliusRole {
  name: string
}

export default interface DeliusUser {
  userId: string
  username: string
  firstName: string
  surname: string
  email: string
  enabled: boolean
  roles: Array<DeliusRole>
}

export interface RamDeliusUser {
  username: string
  name: Name
  email?: string
}

export interface Name {
  forename: string
  surname: string
}
