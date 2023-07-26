import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'

describe(ServiceUserBannerPresenter, () => {
  describe('serviceUserEmail', () => {
    it('returns email address or not found message', () => {
      const serviceUser = serviceUserFactory.build()
      const { emailAddress } = serviceUser.contactDetails

      const presenterWithEmail = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithEmail.serviceUserEmail).toEqual(emailAddress)

      serviceUser.contactDetails.emailAddress = undefined
      const presenterWithoutEmail = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithoutEmail.serviceUserEmail).toEqual('Not found')
    })
  })

  describe('serviceUserMobile', () => {
    it('returns mobile number or not found message', () => {
      const serviceUser = serviceUserFactory.build()
      const { mobileNumber } = serviceUser.contactDetails

      const presenterWithMobile = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithMobile.serviceUserMobile).toEqual(mobileNumber)

      serviceUser.contactDetails.mobileNumber = undefined
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
    })
  })

  describe('name', () => {
    it('returns a formatted full name', () => {
      const serviceUser = serviceUserFactory.build()
      serviceUser.name.forename = 'tom'
      serviceUser.name.surname = 'jones'

      const presenter = new ServiceUserBannerPresenter(serviceUser)
      expect(presenter.name).toEqual('Tom Jones')
    })
  })

  describe('crn', () => {
    it('returns the service user crn', () => {
      const serviceUser = serviceUserFactory.build({ crn: 'X123456' })
      const presenter = new ServiceUserBannerPresenter(serviceUser)

      expect(presenter.crn).toEqual('X123456')
    })
  })
})
