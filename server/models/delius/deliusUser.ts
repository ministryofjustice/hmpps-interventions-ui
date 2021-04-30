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
