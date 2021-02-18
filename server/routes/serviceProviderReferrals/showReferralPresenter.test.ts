import ShowReferralPresenter from './showReferralPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import { DeliusServiceUser } from '../../services/communityApiService'

describe(ShowReferralPresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
  const referralFields = sentReferralFactory.build({
    referral: { serviceCategoryId: serviceCategory.id, serviceUser: { firstName: 'Jenny', lastName: 'Jones' } },
  }).referral
  const deliusUser = deliusUserFactory.build({
    firstName: 'Bernard',
    surname: 'Beaks',
    email: 'bernard.beaks@justice.gov.uk',
  })
  const serviceUser = deliusServiceUser.build({
    firstName: 'Alex',
    surname: 'River',
    dateOfBirth: '1980-01-01',
    contactDetails: {
      emailAddresses: ['alex.river@example.com'],
      phoneNumbers: [
        {
          number: '07123456789',
          type: 'MOBILE',
        },
      ],
    },
  })

  describe('text', () => {
    it('returns text to be displayed', () => {
      const presenter = new ShowReferralPresenter(referralFields, serviceCategory, deliusUser, serviceUser)

      expect(presenter.text).toEqual({ title: 'Accommodation referral for Jenny Jones' })
    })
  })

  describe('probationPractitionerDetails', () => {
    it('returns a summary list of probation practitioner details', () => {
      const presenter = new ShowReferralPresenter(referralFields, serviceCategory, deliusUser, serviceUser)

      expect(presenter.probationPractitionerDetails).toEqual([
        { isList: false, key: 'Name', lines: ['Bernard Beaks'] },
        { isList: false, key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
      ])
    })
  })

  describe('serviceUserNotificationBannerArgs', () => {
    describe('when all contact details are present on the Delius Service User', () => {
      it('returns a notification banner with service user details', () => {
        const presenter = new ShowReferralPresenter(referralFields, serviceCategory, deliusUser, serviceUser)

        expect(presenter.serviceUserNotificationBannerArgs).toEqual({
          titleText: 'Service user details',
          html:
            `<p class="govuk-notification-banner__heading">Alex River<p>` +
            `<p>Date of birth: 1 January 1980</p>` +
            `<p class="govuk-body">07123456789 | alex.river@example.com</p>`,
        })
      })
    })

    describe('if contact details are missing on the Delius Service User', () => {
      it('displays a useful message to the user in the banner', () => {
        const serviceUserWithoutContactDetails = {
          firstName: 'Alex',
          surname: 'River',
          dateOfBirth: '1980-01-01',
          contactDetails: {},
        } as DeliusServiceUser

        const presenter = new ShowReferralPresenter(
          referralFields,
          serviceCategory,
          deliusUser,
          serviceUserWithoutContactDetails
        )

        expect(presenter.serviceUserNotificationBannerArgs).toEqual({
          titleText: 'Service user details',
          html:
            `<p class="govuk-notification-banner__heading">Alex River<p>` +
            `<p>Date of birth: 1 January 1980</p>` +
            `<p class="govuk-body">Mobile number not found | Email address not found</p>`,
        })
      })
    })
  })
})
