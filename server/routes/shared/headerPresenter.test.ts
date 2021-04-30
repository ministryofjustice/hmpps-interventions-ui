import HeaderPresenter from './headerPresenter'
import LoggedInUser from '../../models/loggedInUser'
import ServiceProviderOrganization from '../../models/hmppsAuth/serviceProviderOrganization'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'

describe(HeaderPresenter, () => {
  const createUser = (organizations: ServiceProviderOrganization[]): LoggedInUser => {
    return loggedInUserFactory.build({ name: 'john percy smith', organizations })
  }

  describe('userDescription', () => {
    describe('when there is no logged-in user', () => {
      it('returns an empty string', () => {
        const presenter = new HeaderPresenter(null)
        expect(presenter.userDescription).toEqual('')
      })
    })

    describe('when there is a logged-in user', () => {
      describe('and they have no organizations', () => {
        it('returns their abbreviated name', () => {
          const user = createUser([])
          const presenter = new HeaderPresenter(user)
          expect(presenter.userDescription).toEqual('J. Smith')
        })
      })

      describe('and they have organizations', () => {
        it('returns their abbreviated name and the name of their first organization', () => {
          const user = createUser([{ id: '', name: 'Harmony Living' }])
          const presenter = new HeaderPresenter(user)
          expect(presenter.userDescription).toEqual('J. Smith (Harmony Living)')
        })
      })
    })
  })
})
