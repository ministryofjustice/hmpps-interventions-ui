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

export function authUserFullName(user: AuthUserDetails): string {
  return user.userId ? `${user.firstName} ${user.lastName}` : 'Deactivated R&M account'
}
