import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import interventionFactory from '../../../testutils/factories/intervention'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import deliusOffenderManagerFactory from '../../../testutils/factories/deliusOffenderManager'
import serviceProviderSentReferralSummaryFactory from '../../../testutils/factories/serviceProviderSentReferralSummary'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'

describe('When viewing the referrals details page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  describe('as a Service Provider', () => {
    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')
    })

    it('User views a list of sent referrals and the referral details page', () => {
      const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

      const personalWellbeingIntervention = interventionFactory.build({
        contractType: { code: 'PWB', name: 'Personal wellbeing' },
        title: 'Personal Wellbeing - West Midlands',
        serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
      })

      const socialInclusionIntervention = interventionFactory.build({
        contractType: { code: 'SOC', name: 'Social inclusion' },
        title: 'Social Inclusion - West Midlands',
        serviceCategories: [socialInclusionServiceCategory],
      })

      const conviction = deliusConvictionFactory.build({
        offences: [
          {
            mainOffence: true,
            detail: {
              mainCategoryDescription: 'Burglary',
              subCategoryDescription: 'Theft act, 1968',
            },
          },
        ],
        sentence: {
          expectedSentenceEndDate: '2025-11-15',
        },
      })

      const sentReferrals = [
        sentReferralFactory.build({
          sentAt: '2021-01-26T13:00:00.000000Z',
          referenceNumber: 'ABCABCA1',
          referral: {
            interventionId: socialInclusionIntervention.id,
            serviceUser: { firstName: 'George', lastName: 'Michael' },
            serviceCategoryIds: [socialInclusionServiceCategory.id],
          },
        }),
        sentReferralFactory.build({
          sentAt: '2020-09-13T13:00:00.000000Z',
          referenceNumber: 'ABCABCA2',
          referral: {
            interventionId: personalWellbeingIntervention.id,
            relevantSentenceId: conviction.convictionId,
            serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
            serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
            complexityLevels: [
              {
                serviceCategoryId: accommodationServiceCategory.id,
                complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
              },
              {
                serviceCategoryId: socialInclusionServiceCategory.id,
                complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
              },
            ],
            desiredOutcomes: [
              {
                serviceCategoryId: accommodationServiceCategory.id,
                desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
              },
              {
                serviceCategoryId: socialInclusionServiceCategory.id,
                desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
              },
            ],
          },
        }),
      ]

      const deliusUser = deliusUserFactory.build({
        firstName: 'Bernard',
        surname: 'Beaks',
        email: 'bernard.beaks@justice.gov.uk',
      })

      const deliusServiceUser = deliusServiceUserFactory.build({
        firstName: 'Jenny',
        surname: 'Jones',
        dateOfBirth: '1980-01-01',
        contactDetails: {
          emailAddresses: ['jenny.jones@example.com', 'JJ@example.com'],
          phoneNumbers: [
            {
              number: '07123456789',
              type: 'MOBILE',
            },
            {
              number: '0798765432',
              type: 'MOBILE',
            },
          ],
        },
      })

      const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({
        ...deliusServiceUser,
        contactDetails: {
          emailAddresses: ['jenny.jones@example.com', 'JJ@example.com'],
          phoneNumbers: [
            {
              number: '07123456789',
              type: 'MOBILE',
            },
            {
              number: '0798765432',
              type: 'MOBILE',
            },
          ],
          addresses: [
            {
              addressNumber: 'Flat 2',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2019-01-01',
              to: null,
              noFixedAbode: false,
            },
          ],
        },
      })

      const referralToSelect = sentReferrals[1]

      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
        riskSummaryComments: 'They are low risk.',
      })

      const responsibleOfficer = deliusOffenderManagerFactory.build({
        staff: {
          forenames: 'Peter',
          surname: 'Practitioner',
          email: 'p.practitioner@justice.gov.uk',
          phoneNumber: '01234567890',
        },
        team: {
          telephone: '07890 123456',
          emailAddress: 'probation-team4692@justice.gov.uk',
          startDate: '2021-01-01',
        },
      })
      const sentReferralsSummary = [
        serviceProviderSentReferralSummaryFactory
          .fromReferralAndIntervention(sentReferrals[0], socialInclusionIntervention)
          .build({}),
        serviceProviderSentReferralSummaryFactory
          .fromReferralAndIntervention(sentReferrals[1], personalWellbeingIntervention)
          .build({}),
      ]

      cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
      cy.stubGetIntervention(socialInclusionIntervention.id, socialInclusionIntervention)
      sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
      cy.stubGetSentReferralsForUserToken(sentReferrals)
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken(sentReferralsSummary)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetServiceUserByCRN(referralToSelect.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetExpandedServiceUserByCRN(referralToSelect.referral.serviceUser.crn, expandedDeliusServiceUser)
      cy.stubGetConvictionById(referralToSelect.referral.serviceUser.crn, conviction.convictionId, conviction)
      cy.stubGetSupplementaryRiskInformation(referralToSelect.supplementaryRiskId, supplementaryRiskInformation)
      cy.stubGetResponsibleOfficerForServiceUser(referralToSelect.referral.serviceUser.crn, [responsibleOfficer])

      cy.login()

      cy.get('h1').contains('All cases')

      cy.get('table')
        .getTable()
        .should('deep.equal', [
          {
            'Date received': '26 Jan 2021',
            'Intervention type': 'Social Inclusion - West Midlands',
            Referral: 'ABCABCA1',
            'Service user': 'George Michael',
            Caseworker: '',
            Action: 'View',
          },
          {
            'Date received': '13 Sep 2020',
            'Intervention type': 'Personal Wellbeing - West Midlands',
            Referral: 'ABCABCA2',
            'Service user': 'Jenny Jones',
            Caseworker: '',
            Action: 'View',
          },
        ])

      cy.contains('.govuk-table__row', 'Jenny Jones').within(() => {
        cy.contains('View').click()
      })
      cy.location('pathname').should('equal', `/service-provider/referrals/${referralToSelect.id}/details`)
      cy.get('h2').contains('Who do you want to assign this referral to?')
      cy.contains('jenny.jones@example.com')
      cy.contains('07123456789')
      cy.contains('Intervention details')
      cy.contains('Personal wellbeing')

      cy.contains('Burglary')
      cy.contains('Theft act, 1968')
      cy.contains('15 November 2025')

      cy.contains('Accommodation service')
      cy.contains('LOW COMPLEXITY')
      cy.contains('Service user has some capacity and means to secure')
      cy.contains('All barriers, as identified in the Service user action plan')
      cy.contains('Service user makes progress in obtaining accommodation')

      cy.contains('Social inclusion service')
      cy.contains('MEDIUM COMPLEXITY')
      cy.contains('Service user is at risk of homelessness/is homeless')
      cy.contains('Service user is helped to secure social or supported housing')
      cy.contains('Service user is helped to secure a tenancy in the private rented sector (PRS)')

      cy.contains("Service user's personal details")
      cy.contains('English')
      cy.contains('Agnostic')
      cy.contains('Autism spectrum condition')
      cy.contains('sciatica')
      cy.contains("Service user's personal details")
        .next()
        .contains('Email address')
        .next()
        .contains('jenny.jones@example.com')
      cy.contains("Service user's personal details").next().contains('Phone number').next().contains('07123456789')
      cy.contains('Flat 2 Test Walk')
      cy.contains('London')
      cy.contains('City of London')
      cy.contains('Greater London')
      cy.contains('SW16 1AQ')
      cy.contains("Service user's risk information")
      cy.contains('They are low risk.')
      cy.contains("Service user's needs")
      cy.contains('Alex is currently sleeping on her aunt’s sofa')
      cy.contains('She uses a wheelchair')
      cy.contains('Spanish')
      cy.contains('She works Mondays 9am - midday')

      cy.contains('Responsible officer details').next().contains('Name').next().contains('Peter Practitioner')
      cy.contains('Responsible officer details').next().contains('Phone').next().contains('01234567890')
      cy.contains('Responsible officer details')
        .next()
        .contains('Email')
        .next()
        .contains('p.practitioner@justice.gov.uk')
      cy.contains('Responsible officer details').next().contains('Team phone').next().contains('07890 123456')
      cy.contains('Responsible officer details')
        .next()
        .contains('Team email address')
        .next()
        .contains('probation-team4692@justice.gov.uk')

      cy.contains('Bernard Beaks')
      cy.contains('bernard.beaks@justice.gov.uk')
    })

    describe('Assigning a referral to a caseworker', () => {
      it('User assigns a referral to a caseworker', () => {
        const intervention = interventionFactory.build()
        const conviction = deliusConvictionFactory.build()

        const referralParams = {
          referral: {
            interventionId: intervention.id,
            serviceCategoryIds: [intervention.serviceCategories[0].id],
            relevantSentenceId: conviction.convictionId,
          },
        }

        const referral = sentReferralFactory.build(referralParams)
        const deliusUser = deliusUserFactory.build()
        const deliusServiceUser = deliusServiceUserFactory.build()
        const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({ ...deliusServiceUser })
        const hmppsAuthUser = hmppsAuthUserFactory.build({
          firstName: 'John',
          lastName: 'Smith',
          username: 'john.smith',
        })
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const responsibleOfficer = deliusOffenderManagerFactory.build()
        let referralSummary = serviceProviderSentReferralSummaryFactory
          .fromReferralAndIntervention(referral, intervention)
          .build()
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetSentReferral(referral.id, referral)
        cy.stubGetSentReferralsForUserToken([referral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([referralSummary])
        cy.stubGetUserByUsername(deliusUser.username, deliusUser)
        cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetExpandedServiceUserByCRN(referral.referral.serviceUser.crn, expandedDeliusServiceUser)
        cy.stubGetAuthUserByEmailAddress([hmppsAuthUser])
        cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
        cy.stubAssignSentReferral(referral.id, referral)
        cy.stubGetConvictionById(referral.referral.serviceUser.crn, conviction.convictionId, conviction)
        cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
        cy.stubGetResponsibleOfficerForServiceUser(referral.referral.serviceUser.crn, [responsibleOfficer])

        cy.login()

        cy.visit(`/service-provider/referrals/${referral.id}/details`)

        cy.get('h2').contains('Who do you want to assign this referral to?')

        cy.get('#email').type('john@harmonyliving.org.uk')
        cy.contains('Save and continue').click()

        cy.location('pathname').should(
          'match',
          new RegExp(`/service-provider/referrals/${referral.id}/assignment/[a-z0-9-]+/check`)
        )
        cy.get('h1').contains('Confirm the Accommodation referral assignment')
        cy.contains('John Smith')

        const assignedReferral = sentReferralFactory
          .assigned()
          .build({ ...referralParams, id: referral.id, assignedTo: { username: hmppsAuthUser.username } })
        cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
        cy.stubGetSentReferralsForUserToken([assignedReferral])
        referralSummary = serviceProviderSentReferralSummaryFactory
          .fromReferralAndIntervention(assignedReferral, intervention)
          .withAssignedUser(hmppsAuthUser.username)
          .build()
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([referralSummary])

        cy.contains('Confirm assignment').click()

        cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/assignment/confirmation`)
        cy.get('h1').contains('Caseworker assigned')

        cy.contains('Return to dashboard').click()

        cy.location('pathname').should('equal', `/service-provider/dashboard`)
        cy.contains('john.smith')

        cy.visit(`/service-provider/referrals/${referral.id}/details`)
        cy.contains('This intervention is assigned to John Smith.')
      })

      it('User re-assigns a referral to a different caseworker', () => {
        const intervention = interventionFactory.build()
        const conviction = deliusConvictionFactory.build()

        const referralParams = {
          referral: {
            interventionId: intervention.id,
            serviceCategoryIds: [intervention.serviceCategories[0].id],
            relevantSentenceId: conviction.convictionId,
          },
        }

        const currentAssignee = hmppsAuthUserFactory.build({
          firstName: 'John',
          lastName: 'Smith',
          username: 'john.smith',
        })
        const referral = sentReferralFactory
          .assigned()
          .build({ ...referralParams, assignedTo: { username: currentAssignee.username } })
        const deliusUser = deliusUserFactory.build()
        const deliusServiceUser = deliusServiceUserFactory.build()
        const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({ ...deliusServiceUser })
        const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
        const responsibleOfficer = deliusOffenderManagerFactory.build()
        let referralSummary = serviceProviderSentReferralSummaryFactory
          .fromReferralAndIntervention(referral, intervention)
          .withAssignedUser(currentAssignee.username)
          .build()
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetSentReferral(referral.id, referral)
        cy.stubGetSentReferralsForUserToken([referral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([referralSummary])
        cy.stubGetUserByUsername(deliusUser.username, deliusUser)
        cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetExpandedServiceUserByCRN(referral.referral.serviceUser.crn, expandedDeliusServiceUser)
        cy.stubGetAuthUserByEmailAddress([currentAssignee])
        cy.stubGetAuthUserByUsername(currentAssignee.username, currentAssignee)
        cy.stubAssignSentReferral(referral.id, referral)
        cy.stubGetConvictionById(referral.referral.serviceUser.crn, conviction.convictionId, conviction)
        cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
        cy.stubGetResponsibleOfficerForServiceUser(referral.referral.serviceUser.crn, [responsibleOfficer])

        cy.login()

        cy.visit(`/service-provider/referrals/${referral.id}/details`)

        cy.contains('This intervention is assigned to John Smith.')

        cy.get('h2').contains('Who do you want to assign this referral to?')

        const newAssignee = hmppsAuthUserFactory.build({
          firstName: 'Anna',
          lastName: 'Dawkins',
          username: 'anna.dawkins',
        })
        cy.stubGetAuthUserByEmailAddress([newAssignee])
        cy.stubGetAuthUserByUsername(newAssignee.username, newAssignee)

        cy.get('#email').type('anna@harmonyliving.org.uk')
        cy.contains('Save and continue').click()

        cy.location('pathname').should(
          'match',
          new RegExp(`/service-provider/referrals/${referral.id}/assignment/[a-z0-9-]+/check`)
        )
        cy.get('h1').contains('Confirm the Accommodation referral assignment')
        cy.contains('Anna Dawkins')

        const reAssignedReferral = sentReferralFactory
          .assigned()
          .build({ ...referral, assignedTo: { username: newAssignee.username } })
        referralSummary = serviceProviderSentReferralSummaryFactory
          .fromReferralAndIntervention(reAssignedReferral, intervention)
          .withAssignedUser(newAssignee.username)
          .build()
        cy.stubGetSentReferral(reAssignedReferral.id, reAssignedReferral)
        cy.stubGetSentReferralsForUserToken([reAssignedReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([referralSummary])

        cy.contains('Confirm assignment').click()

        cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/assignment/confirmation`)
        cy.get('h1').contains('Caseworker assigned')

        cy.visit(`/service-provider/referrals/${referral.id}/details`)
        cy.contains('This intervention is assigned to Anna Dawkins.')
      })
    })
  })

  describe('as a Probation Practitioner', () => {
    beforeEach(() => {
      cy.task('stubProbationPractitionerToken')
      cy.task('stubProbationPractitionerAuthUser')
    })

    it('probation practitioner views referral details', () => {
      cy.stubGetSentReferralsForUserToken([])

      const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

      const personalWellbeingIntervention = interventionFactory.build({
        contractType: { code: 'PWB', name: 'Personal wellbeing' },
        serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
      })

      const conviction = deliusConvictionFactory.build({
        offences: [
          {
            mainOffence: true,
            detail: {
              mainCategoryDescription: 'Burglary',
              subCategoryDescription: 'Theft act, 1968',
            },
          },
        ],
        sentence: {
          expectedSentenceEndDate: '2025-11-15',
        },
      })

      const referral = sentReferralFactory.build({
        sentAt: '2020-09-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: personalWellbeingIntervention.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          relevantSentenceId: conviction.convictionId,
          serviceCategoryIds: [accommodationServiceCategory.id, socialInclusionServiceCategory.id],
          complexityLevels: [
            {
              serviceCategoryId: accommodationServiceCategory.id,
              complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
            },
            {
              serviceCategoryId: socialInclusionServiceCategory.id,
              complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
            },
          ],
          desiredOutcomes: [
            {
              serviceCategoryId: accommodationServiceCategory.id,
              desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
            },
            {
              serviceCategoryId: socialInclusionServiceCategory.id,
              desiredOutcomesIds: ['9b30ffad-dfcb-44ce-bdca-0ea49239a21a', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
            },
          ],
        },
      })

      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
        riskSummaryComments: 'They are low risk.',
      })

      const deliusUser = deliusUserFactory.build({
        firstName: 'Bernard',
        surname: 'Beaks',
        email: 'bernard.beaks@justice.gov.uk',
      })

      const deliusServiceUser = deliusServiceUserFactory.build({
        firstName: 'Jenny',
        surname: 'Jones',
        dateOfBirth: '1980-01-01',
        contactDetails: {
          emailAddresses: ['jenny.jones@example.com'],
          phoneNumbers: [
            {
              number: '07123456789',
              type: 'MOBILE',
            },
          ],
        },
      })

      const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({
        ...deliusServiceUser,
        contactDetails: {
          emailAddresses: ['jenny.jones@example.com'],
          phoneNumbers: [
            {
              number: '07123456789',
              type: 'MOBILE',
            },
          ],
          addresses: [
            {
              addressNumber: 'Flat 2',
              buildingName: null,
              streetName: 'Test Walk',
              postcode: 'SW16 1AQ',
              town: 'London',
              district: 'City of London',
              county: 'Greater London',
              from: '2019-01-01',
              to: null,
              noFixedAbode: false,
            },
          ],
        },
      })

      const responsibleOfficer = deliusOffenderManagerFactory.build({
        staff: {
          forenames: 'Peter',
          surname: 'Practitioner',
          email: 'p.practitioner@justice.gov.uk',
          phoneNumber: '01234567890',
        },
        team: {
          telephone: '07890 123456',
          emailAddress: 'probation-team4692@justice.gov.uk',
          startDate: '2021-01-01',
        },
      })

      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetExpandedServiceUserByCRN(referral.referral.serviceUser.crn, expandedDeliusServiceUser)
      cy.stubGetConvictionById(referral.referral.serviceUser.crn, conviction.convictionId, conviction)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
      cy.stubGetResponsibleOfficerForServiceUser(referral.referral.serviceUser.crn, [responsibleOfficer])

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${referral.id}/details`)

      cy.contains('This intervention is not yet assigned to a caseworker')

      cy.contains('07123456789')
      cy.contains('jenny.jones@example.com')
      cy.contains('Flat 2')
      cy.contains('Test Walk')
      cy.contains('London')
      cy.contains('City of London')
      cy.contains('Greater London')
      cy.contains('SW16 1AQ')

      cy.contains('Intervention details')
      cy.contains('Personal wellbeing')
      cy.contains('Burglary')
      cy.contains('Theft act, 1968')
      cy.contains('15 November 2025')

      cy.contains('Accommodation service')
      cy.contains('LOW COMPLEXITY')
      cy.contains('Service user has some capacity and means to secure')
      cy.contains('All barriers, as identified in the Service user action plan')
      cy.contains('Service user makes progress in obtaining accommodation')

      cy.contains('Social inclusion service')
      cy.contains('MEDIUM COMPLEXITY')
      cy.contains('Service user is at risk of homelessness/is homeless')
      cy.contains('Service user is helped to secure social or supported housing')
      cy.contains('Service user is helped to secure a tenancy in the private rented sector (PRS)')

      cy.contains("Service user's personal details")
      cy.contains('English')
      cy.contains('Agnostic')
      cy.contains('Autism spectrum condition')
      cy.contains('sciatica')
      cy.contains("Service user's personal details")
        .next()
        .contains('Email address')
        .next()
        .contains('jenny.jones@example.com')
      cy.contains("Service user's personal details").next().contains('Phone number').next().contains('07123456789')
      cy.contains("Service user's risk information")
      cy.contains('They are low risk.')
      cy.contains("Service user's needs")
      cy.contains('Alex is currently sleeping on her aunt’s sofa')
      cy.contains('She uses a wheelchair')
      cy.contains('Spanish')
      cy.contains('She works Mondays 9am - midday')

      cy.contains('Responsible officer details').next().contains('Name').next().contains('Peter Practitioner')
      cy.contains('Responsible officer details').next().contains('Phone').next().contains('01234567890')
      cy.contains('Responsible officer details')
        .next()
        .contains('Email')
        .next()
        .contains('p.practitioner@justice.gov.uk')
      cy.contains('Responsible officer details').next().contains('Team phone').next().contains('07890 123456')
      cy.contains('Responsible officer details')
        .next()
        .contains('Team email address')
        .next()
        .contains('probation-team4692@justice.gov.uk')

      cy.contains('Bernard Beaks')
      cy.contains('bernard.beaks@justice.gov.uk')
    })
  })
})
