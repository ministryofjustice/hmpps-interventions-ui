export default interface AuthUserDetails {
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
  locked: boolean
  enabled: boolean
  verified: boolean
  lastLoggedIn: string
}
