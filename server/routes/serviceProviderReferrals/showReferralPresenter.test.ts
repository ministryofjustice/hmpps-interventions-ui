import ShowReferralPresenter from './showReferralPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import { DeliusServiceUser } from '../../services/communityApiService'

describe(ShowReferralPresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({
    name: 'accommodation',
    complexityLevels: [
      {
        id: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        title: 'Low complexity',
        description:
          'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
      },
      {
        id: '110f2405-d944-4c15-836c-0c6684e2aa78',
        title: 'Medium complexity',
        description:
          'Service User is at risk of homelessness/is homeless, or will be on release from prison. Service User has had some success in maintaining atenancy but may have additional needs e.g. Learning Difficulties and/or Learning Disabilities or other challenges currently.',
      },
      {
        id: 'c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6',
        title: 'High complexity',
        description:
          'Service User is homeless or in temporary/unstable accommodation, or will be on release from prison. Service User has poor accommodation history, complex needs and limited skills to secure or sustain a tenancy.',
      },
    ],
    desiredOutcomes: [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service User makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service User is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service User is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ],
  })

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

      expect(presenter.text).toEqual({
        title: 'Accommodation referral for Jenny Jones',
        interventionDetailsSummaryHeading: 'Accommodation intervention details',
      })
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

  describe('interventionDetails', () => {
    describe('when all possibly optional fields have been set on the referral, including RAR days', () => {
      const referralFieldsAllOptional = {
        createdAt: '2020-12-07T20:45:21.986389Z',
        completionDeadline: '2021-04-01',
        serviceProvider: {
          name: 'Harmony Living',
        },
        serviceCategoryId: serviceCategory.id,
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        furtherInformation: 'Some information about the service user',
        desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
        additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
        accessibilityNeeds: 'She uses a wheelchair',
        needsInterpreter: true,
        interpreterLanguage: 'Spanish',
        hasAdditionalResponsibilities: true,
        whenUnavailable: 'She works Mondays 9am - midday',
        serviceUser: {
          crn: 'X123456',
          title: 'Mr',
          firstName: 'Alex',
          lastName: 'River',
          dateOfBirth: '1980-01-01',
          gender: 'Male',
          ethnicity: 'British',
          preferredLanguage: 'English',
          religionOrBelief: 'Agnostic',
          disabilities: ['Autism spectrum condition', 'sciatica'],
        },
        additionalRiskInformation: 'A danger to the elderly',
        usingRarDays: true,
        maximumRarDays: 10,
      }

      it('returns a summary list of intervention details', () => {
        const presenter = new ShowReferralPresenter(referralFieldsAllOptional, serviceCategory, deliusUser, serviceUser)

        expect(presenter.interventionDetails).toEqual([
          { key: 'Sentence information', lines: ['Not currently set'], isList: false },
          {
            key: 'Desired outcomes',
            lines: [
              'Service User makes progress in obtaining accommodation',
              'Service User is helped to secure social or supported housing',
            ],
            isList: true,
          },
          {
            key: 'Complexity level',
            lines: [
              'Low complexity',
              'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
            ],
            isList: false,
          },
          { key: 'Date to be completed by', lines: ['1 April 2021'], isList: false },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
            isList: false,
          },
          {
            key: 'Further information for the provider',
            lines: ['Some information about the service user'],
            isList: false,
          },
        ])
      })
    })

    describe('when no optional fields have been set on the referral and no RAR days are selected', () => {
      const referralFieldsNoOptional = {
        createdAt: '2020-12-07T20:45:21.986389Z',
        completionDeadline: '2021-04-01',
        serviceProvider: {
          name: 'Harmony Living',
        },
        serviceCategoryId: serviceCategory.id,
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        furtherInformation: '',
        desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
        additionalNeedsInformation: '',
        accessibilityNeeds: '',
        needsInterpreter: false,
        interpreterLanguage: null,
        hasAdditionalResponsibilities: false,
        whenUnavailable: null,
        serviceUser: {
          crn: 'X123456',
          title: 'Mr',
          firstName: 'Alex',
          lastName: 'River',
          dateOfBirth: '1980-01-01',
          gender: 'Male',
          ethnicity: 'British',
          preferredLanguage: 'English',
          religionOrBelief: 'Agnostic',
          disabilities: ['Autism spectrum condition', 'sciatica'],
        },
        additionalRiskInformation: '',
        usingRarDays: false,
        maximumRarDays: null,
      }

      it("returns a summary list of intervention details with a message for fields that haven't been set", () => {
        const presenter = new ShowReferralPresenter(referralFieldsNoOptional, serviceCategory, deliusUser, serviceUser)

        expect(presenter.interventionDetails).toEqual([
          { key: 'Sentence information', lines: ['Not currently set'], isList: false },
          {
            key: 'Desired outcomes',
            lines: [
              'Service User makes progress in obtaining accommodation',
              'Service User is helped to secure social or supported housing',
            ],
            isList: true,
          },
          {
            key: 'Complexity level',
            lines: [
              'Low complexity',
              'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
            ],
            isList: false,
          },
          { key: 'Date to be completed by', lines: ['1 April 2021'], isList: false },
          {
            key: 'Maximum number of enforceable days',
            lines: ['N/A'],
            isList: false,
          },
          {
            key: 'Further information for the provider',
            lines: ['N/A'],
            isList: false,
          },
        ])
      })
    })
  })

  describe('serviceUserPersonalDetails', () => {
    it("returns a summary list of the service user's personal details", () => {
      const presenter = new ShowReferralPresenter(referralFields, serviceCategory, deliusUser, serviceUser)

      expect(presenter.serviceUserDetails).toEqual([
        { key: 'CRN', lines: [referralFields.serviceUser.crn], isList: false },
        { key: 'Title', lines: [referralFields.serviceUser.title], isList: false },
        { key: 'First name', lines: [referralFields.serviceUser.firstName], isList: false },
        { key: 'Last name', lines: [referralFields.serviceUser.lastName], isList: false },
        { key: 'Date of birth', lines: [referralFields.serviceUser.dateOfBirth], isList: false },
        { key: 'Gender', lines: [referralFields.serviceUser.gender], isList: false },
        { key: 'Ethnicity', lines: [referralFields.serviceUser.ethnicity], isList: false },
        { key: 'Preferred language', lines: [referralFields.serviceUser.preferredLanguage], isList: false },
        { key: 'Religion or belief', lines: [referralFields.serviceUser.religionOrBelief], isList: false },
        { key: 'Disabilities', lines: referralFields.serviceUser.disabilities || [], isList: true },
      ])
    })
  })

  describe('serviceUserRisks', () => {
    it("returns a summary list of the service user's risk information", () => {
      const presenter = new ShowReferralPresenter(referralFields, serviceCategory, deliusUser, serviceUser)

      expect(presenter.serviceUserRisks).toEqual([
        { key: 'Risk to known adult', lines: ['Medium'], isList: false },
        { key: 'Risk to public', lines: ['Low'], isList: false },
        { key: 'Risk to children', lines: ['Low'], isList: false },
        { key: 'Risk to staff', lines: ['Low'], isList: false },
        { key: 'Additional risk information', lines: [referralFields.additionalRiskInformation], isList: false },
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
