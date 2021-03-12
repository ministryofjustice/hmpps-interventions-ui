import ServiceUserBannerPresenter from './serviceUserBannerPresenter'
import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'

describe(ServiceUserBannerPresenter, () => {
  describe('serviceUserBannerArgs', () => {
    it('has email address or not found message', () => {
      const serviceUser = serviceUserFactory.build()
      const emailAddress = serviceUser.contactDetails.emailAddresses![0]

      const presenterWithEmail = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithEmail.serviceUserBannerArgs.html).toContain(emailAddress)

      serviceUser.contactDetails.emailAddresses = null
      const presenterWithoutEmail = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithoutEmail.serviceUserBannerArgs.html).toContain('Email address not found')
    })
    it('has mobile number or not found message', () => {
      const serviceUser = serviceUserFactory.build()
      const mobileNumber = serviceUser.contactDetails.phoneNumbers!.filter(x => x.type === 'MOBILE')[0].number

      const presenterWithMobile = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithMobile.serviceUserBannerArgs.html).toContain(mobileNumber)

      serviceUser.contactDetails.phoneNumbers = null
      const presenterWithoutMobile = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithoutMobile.serviceUserBannerArgs.html).toContain('Mobile number not found')
    })
    it('has a formatted date of birth or empty string', () => {
      const serviceUser = serviceUserFactory.build()
      serviceUser.dateOfBirth = '1989-02-10'
      const formattedDOB = '10 February 1989'

      const presenterWithDOB = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithDOB.serviceUserBannerArgs.html).toContain(formattedDOB)

      serviceUser.dateOfBirth = null
      const presenterWithoutDOB = new ServiceUserBannerPresenter(serviceUser)
      expect(presenterWithoutDOB.serviceUserBannerArgs.html).toContain('Date of birth: Not found')
    })
    it('has a formatted full name', () => {
      const serviceUser = serviceUserFactory.build()
      serviceUser.firstName = 'tom'
      serviceUser.surname = 'jones'

      const presenter = new ServiceUserBannerPresenter(serviceUser)
      expect(presenter.serviceUserBannerArgs.html).toContain('Tom Jones')
    })
  })
})
