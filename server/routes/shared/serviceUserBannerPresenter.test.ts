import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'

describe(ServiceUserBannerPresenter, () => {
  describe('serviceUserEmail', () => {
    it('returns email address or not found message', () => {
      const serviceUser = serviceUserFactory.build()
      const emailAddress = serviceUser.contactDetails.emailAddresses![0]

      const presenterWithEmail = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithEmail.serviceUserEmail).toEqual(emailAddress)

      serviceUser.contactDetails.emailAddresses = null
      const presenterWithoutEmail = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithoutEmail.serviceUserEmail).toEqual('Not found')
    })
  })

  describe('serviceUserMobile', () => {
    it('returns mobile number or not found message', () => {
      const serviceUser = serviceUserFactory.build()
      const mobileNumber = serviceUser.contactDetails.phoneNumbers!.filter(x => x.type === 'MOBILE')[0].number

      const presenterWithMobile = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithMobile.serviceUserMobile).toEqual(mobileNumber)

      serviceUser.contactDetails.phoneNumbers = null
      const presenterWithoutMobile = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithoutMobile.serviceUserMobile).toEqual('Not found')
    })
  })

  describe('dateOfBirth', () => {
    it('returns a formatted date of birth or not found message', () => {
      const serviceUser = serviceUserFactory.build()
      serviceUser.dateOfBirth = '1989-02-10'

      const presenterWithDOB = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithDOB.dateOfBirth).toEqual('10 February 1989')

      serviceUser.dateOfBirth = null
      const presenterWithoutDOB = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithoutDOB.dateOfBirth).toEqual('Not found')
    })
  })

  describe('name', () => {
    it('returns a formatted full name', () => {
      const serviceUser = serviceUserFactory.build()
      serviceUser.firstName = 'tom'
      serviceUser.surname = 'jones'

      const presenter = new ServiceUserBannerPresenter(serviceUser)
      expect(presenter.name).toEqual('Tom Jones')
    })
  })

  describe('crn', () => {
    it('returns the service user crn', () => {
      const serviceUser = serviceUserFactory.build({ otherIds: { crn: 'X123456' } })
      const presenter = new ServiceUserBannerPresenter(serviceUser)

      expect(presenter.crn).toEqual('X123456')
    })
  })
})