import AuthUserDetails, { authUserFullName } from './authUserDetails'

describe('authUserFullName', () => {
  describe('when the user exists', () => {
    it('returns the full name of the person', () => {
      const user = { firstName: 'Firstname', lastName: 'Lastname', userId: 'something' } as AuthUserDetails
      expect(authUserFullName(user)).toEqual('Firstname Lastname')
    })
  })

  describe('when the user is missing', () => {
    it('returns "a deleted person"', () => {
      const user = { username: 'deleted_person_username' } as AuthUserDetails
      expect(authUserFullName(user)).toEqual('Deactivated R&M account')
    })
  })
})
