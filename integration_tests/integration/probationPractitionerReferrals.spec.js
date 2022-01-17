import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import endOfServiceReportFactory from '../../testutils/factories/endOfServiceReport'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import interventionFactory from '../../testutils/factories/intervention'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusConvictionFactory from '../../testutils/factories/deliusConviction'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import deliusOffenderManagerFactory from '../../testutils/factories/deliusOffenderManager'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../testutils/factories/initialAssessmentAppointment'
import hmppsAuthUserFactory from '../../testutils/factories/hmppsAuthUser'

describe('Probation practitioner referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it("user logs in and sees 'Open cases' screen with list of sent referrals", () => {
    const serviceCategory = serviceCategoryFactory.build()
    const accommodationIntervention = interventionFactory.build({
      contractType: { name: 'accommodation' },
      title: 'Accommodation Services - West Midlands',
    })
    const womensServicesIntervention = interventionFactory.build({
      contractType: { name: "women's services" },
      title: "Women's Services - West Midlands",
    })

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          interventionId: accommodationIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
          serviceCategoryIds: [serviceCategory.id],
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
            },
          ],
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78' },
          ],
        },
      }),
      sentReferralFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        assignedTo: {
          username: 'A. Caseworker',
          userId: '123',
          authSource: 'auth',
        },
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: womensServicesIntervention.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          serviceCategoryIds: [serviceCategory.id],
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
            },
          ],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78' },
          ],
        },
      }),
    ]

    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
    cy.stubGetSentReferralsForUserToken(sentReferrals)

    cy.login()

    cy.get('h1').contains('Open cases')

    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          'Date sent': '26 Jan 2021',
          Referral: 'ABCABCA1',
          'Service user': 'George Michael',
          'Intervention type': 'Accommodation Services - West Midlands',
          Provider: 'Harmony Living',
          Caseworker: 'Unassigned',
          Action: 'View',
        },
        {
          'Date sent': '13 Dec 2020',
          Referral: 'ABCABCA2',
          'Service user': 'Jenny Jones',
          'Intervention type': "Women's Services - West Midlands",
          Provider: 'Harmony Living',
          Caseworker: 'A. Caseworker',
          Action: 'View',
        },
      ])
  })

  it('user views an end of service report', () => {
    cy.stubGetSentReferralsForUserToken([])
    cy.login()
    const serviceCategory1 = serviceCategoryFactory.build()
    const serviceCategory2 = serviceCategoryFactory.build({
      desiredOutcomes: [
        {
          id: '2d63bedc-9658-40c4-9d31-da649396ace1',
          description: 'Some other desired outcome',
        },
      ],
    })
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory1, serviceCategory2] })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const referral = sentReferralFactory.build({
      referral: {
        interventionId: intervention.id,
        serviceCategoryIds: [serviceCategory1.id, serviceCategory2.id],
        desiredOutcomes: [
          { serviceCategoryId: serviceCategory1.id, desiredOutcomesIds: [serviceCategory1.desiredOutcomes[0].id] },
          { serviceCategoryId: serviceCategory2.id, desiredOutcomesIds: [serviceCategory2.desiredOutcomes[0].id] },
        ],
        serviceUser: { crn: deliusServiceUser.otherIds.crn },
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.build({
      referralId: referral.id,
      outcomes: [
        {
          desiredOutcome: serviceCategory1.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments for serviceCategory1',
          additionalTaskComments: 'Some task comments for serviceCategory1',
        },
        {
          desiredOutcome: serviceCategory2.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments for serviceCategory2',
          additionalTaskComments: 'Some task comments for serviceCategory2',
        },
      ],
      furtherInformation: 'Some further information',
    })

    cy.stubGetEndOfServiceReport(endOfServiceReport.id, endOfServiceReport)
    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetIntervention(intervention.id, intervention)
    cy.stubGetServiceCategory(serviceCategory1.id, serviceCategory1)
    cy.stubGetServiceCategory(serviceCategory2.id, serviceCategory2)
    cy.stubGetServiceUserByCRN(deliusServiceUser.otherIds.crn, deliusServiceUser)

    cy.visit(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)

    cy.contains('End of service report')
    cy.contains('The service provider has created an end of service report')
    cy.contains('Achieved')
    cy.contains(serviceCategory1.desiredOutcomes[0].description)
    cy.contains('Some progression comments for serviceCategory1')
    cy.contains('Some task comments for serviceCategory1')
    cy.contains(serviceCategory2.desiredOutcomes[0].description)
    cy.contains('Some progression comments for serviceCategory1')
    cy.contains('Some task comments for serviceCategory1')
    cy.contains('Some further information')
  })

  describe('probation practitioner views referral progress', () => {
    describe('for initial assessment feedback', () => {
      let assignedReferral
      beforeEach(() => {
        cy.stubGetSentReferralsForUserToken([])
        const intervention = interventionFactory.build()
        const conviction = deliusConvictionFactory.build()
        const hmppsAuthUser = hmppsAuthUserFactory.build({
          firstName: 'John',
          lastName: 'Smith',
          username: 'john.smith',
          email: 'john.smith@example.com',
        })
        assignedReferral = sentReferralFactory.build({
          assignedTo: { username: hmppsAuthUser.username },
          referral: {
            interventionId: intervention.id,
            serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          },
        })
        const deliusUser = deliusUserFactory.build()
        cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
        cy.stubGetExpandedServiceUserByCRN(
          assignedReferral.referral.serviceUser.crn,
          expandedDeliusServiceUserFactory.build()
        )
        cy.stubGetConvictionById(assignedReferral.referral.serviceUser.crn, conviction.convictionId, conviction)
        cy.stubGetUserByUsername(deliusUser.username, deliusUser)
        cy.stubGetSupplementaryRiskInformation(
          assignedReferral.supplementaryRiskId,
          supplementaryRiskInformationFactory.build()
        )

        cy.stubGetAuthUserByEmailAddress([hmppsAuthUser])
        cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
      })

      describe('when the referral has been assigned and the appointment scheduled', () => {
        describe('and the appointment is in the past', () => {
          it('should show the initial appointment as awaiting feedback and a link to view appointment details', () => {
            const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inThePast.build({
              durationInMinutes: 75,
              appointmentDeliveryType: 'PHONE_CALL',
            })
            const supplierAssessment = supplierAssessmentFactory.build({
              appointments: [appointmentWithNoFeedback],
              currentAppointmentId: appointmentWithNoFeedback.id,
            })
            cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
            cy.login()
            cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

            cy.contains('This intervention is assigned to John Smith (john.smith@example.com)')
            cy.contains('Supplier assessment appointment')
              .next()
              .contains('The appointment has been scheduled by the supplier')
              .next()
              .within(() => {
                cy.contains('Appointment status').next().contains('awaiting feedback')
                cy.contains('To do').next().contains('View appointment details').click()
                cy.location('pathname').should(
                  'equal',
                  `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment`
                )
              })
          })
        })

        describe('and the appointment is in the future', () => {
          it('should show the initial appointment as scheduled and a link to view appointment details', () => {
            const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inTheFuture.build({
              durationInMinutes: 75,
              appointmentDeliveryType: 'PHONE_CALL',
            })
            const supplierAssessment = supplierAssessmentFactory.build({
              appointments: [appointmentWithNoFeedback],
              currentAppointmentId: appointmentWithNoFeedback.id,
            })
            cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
            cy.login()
            cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

            cy.contains('This intervention is assigned to John Smith (john.smith@example.com)')

            cy.contains('Supplier assessment appointment')
              .next()
              .contains('The appointment has been scheduled by the supplier')
              .next()
              .within(() => {
                cy.contains('Appointment status').next().contains('scheduled')
                cy.contains('To do').next().contains('View appointment details').click()
                cy.location('pathname').should(
                  'equal',
                  `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment`
                )
              })
          })
        })
      })
      describe('when the referral has been assigned and the appointment delivered and attended', () => {
        it('should show the initial appointment as completed and a link to view the feedback', () => {
          const supplierAssessment = supplierAssessmentFactory.withAttendedAppointment.build()
          cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
          cy.login()
          cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

          cy.contains('This intervention is assigned to John Smith (john.smith@example.com)')

          cy.contains('Supplier assessment appointment')
            .next()
            .contains('The initial assessment has been delivered and feedback added.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('completed')
              cy.contains('To do').next().contains('View feedback').click()
              cy.location('pathname').should(
                'equal',
                `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment/post-assessment-feedback`
              )
            })
        })
      })
      describe('when the referral has been assigned and the appointment delivered but not attended', () => {
        it('should show the initial appointment as not attended and a link to view the feedback', () => {
          const supplierAssessment = supplierAssessmentFactory.withNonAttendedAppointment.build()
          cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
          cy.login()
          cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

          cy.contains('This intervention is assigned to John Smith (john.smith@example.com)')

          cy.contains('Supplier assessment appointment')
            .next()
            .contains('The initial assessment has been delivered and feedback added.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('did not attend')
              cy.contains('To do').next().contains('View feedback').click()
              cy.location('pathname').should(
                'equal',
                `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment/post-assessment-feedback`
              )
            })
        })
      })
    })
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
      sentAt: '2020-12-13T13:00:00.000000Z',
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
    cy.contains('Responsible officer details').next().contains('Email').next().contains('p.practitioner@justice.gov.uk')
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
