import moment from 'moment-timezone'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import sentReferralSummariesFactory from '../../testutils/factories/sentReferralSummaries'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import endOfServiceReportFactory from '../../testutils/factories/endOfServiceReport'
import deliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import interventionFactory from '../../testutils/factories/intervention'
import ramDeliusUserFactory from '../../testutils/factories/ramDeliusUser'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../testutils/factories/initialAssessmentAppointment'
import hmppsAuthUserFactory from '../../testutils/factories/hmppsAuthUser'
import pageFactory from '../../testutils/factories/page'
import prisonFactory from '../../testutils/factories/prison'
import deliusResponsibleOfficerFactory from '../../testutils/factories/deliusResponsibleOfficer'
import { CurrentLocationType } from '../../server/models/draftReferral'
import caseConvictionFactory from '../../testutils/factories/caseConviction'

describe('Probation practitioner referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it("user logs in and sees 'Open cases' screen with list of sent referrals", () => {
    const accommodationIntervention = interventionFactory.build({
      contractType: { name: 'accommodation' },
      title: 'Accommodation Services - West Midlands',
    })
    const womensServicesIntervention = interventionFactory.build({
      contractType: { name: "women's services" },
      title: "Women's Services - West Midlands",
    })

    const sentReferrals = [
      sentReferralSummariesFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        assignedTo: null,
        serviceUser: { firstName: 'George', lastName: 'Michael' },
      }),
      sentReferralSummariesFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        assignedTo: {
          username: 'A. Caseworker',
          userId: '123',
          authSource: 'auth',
        },
        referenceNumber: 'ABCABCA2',
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        interventionTitle: "Women's Services - West Midlands",
      }),
    ]
    const page = pageFactory
      .pageContent(sentReferrals)
      .build({ totalElements: sentReferrals.length, totalPages: 2, size: 1 })

    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
    cy.stubGetSentReferralsForUserTokenPaged(page)

    cy.login()

    cy.get('h1').contains('Open cases')

    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          'Date sent': '26 Jan 2021',
          Referral: 'ABCABCA1',
          Person: 'George Michael',
          'Intervention type': 'Accommodation Services - West Midlands',
          Provider: 'Harmony Living',
          Caseworker: 'Unassigned',
          Action: 'View',
        },
        {
          'Date sent': '13 Dec 2020',
          Referral: 'ABCABCA2',
          Person: 'Jenny Jones',
          'Intervention type': "Women's Services - West Midlands",
          Provider: 'Harmony Living',
          Caseworker: 'A. Caseworker',
          Action: 'View',
        },
      ])
    cy.get('nav').contains('1')
    cy.contains('Next')
    cy.contains('Showing 1 to 1 of 2 results')
  })

  it('user views an end of service report', () => {
    const page = pageFactory.pageContent([]).build()
    cy.stubGetSentReferralsForUserTokenPaged(page)
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
        serviceUser: { crn: deliusServiceUser.crn },
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
    cy.stubGetCaseDetailsByCrn(deliusServiceUser.crn, deliusServiceUser)

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
      const page = pageFactory.pageContent([]).build()
      beforeEach(() => {
        cy.stubGetSentReferralsForUserTokenPaged(page)
        const intervention = interventionFactory.build()
        const conviction = caseConvictionFactory.build()
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
        const deliusUser = ramDeliusUserFactory.build()
        cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [])
        cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
        cy.stubGetConvictionByCrnAndId(assignedReferral.referral.serviceUser.crn, conviction.conviction.id, conviction)
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
                cy.contains('Appointment status').next().contains('needs feedback')
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

  it('probation practitioner views referral details when in custody', () => {
    const page = pageFactory.pageContent([]).build()
    cy.stubGetSentReferralsForUserTokenPaged(page)

    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

    const personalWellbeingIntervention = interventionFactory.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build({
      caseDetail: {
        name: {
          firstName: 'Jenny',
          surname: 'Jones',
        },
        contactDetails: {
          emailAddress: 'jenny.jones@example.com',
          mobileNumber: '07123456789',
        },
      },
      conviction: {
        mainOffence: {
          category: 'Burglary',
          subCategory: 'Theft act, 1968',
        },
        sentence: {
          expectedEndDate: '2025-11-15',
        },
      },
    })

    const referral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.conviction.id,
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

    cy.stubGetApprovedActionPlanSummaries(referral.id, [])

    const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'They are low risk.',
    })

    const deliusUser = ramDeliusUserFactory.build()

    const deliusServiceUser = conviction.caseDetail

    const prisons = prisonFactory.prisonList()

    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
    cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetConvictionByCrnAndId(referral.referral.serviceUser.crn, conviction.conviction.id, conviction)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
    cy.stubGetApprovedActionPlanSummaries(referral.id, [])
    cy.stubGetResponsibleOfficer(referral.referral.serviceUser.crn, deliusResponsibleOfficerFactory.build())
    cy.stubGetPrisons(prisons)

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
    cy.contains('15 Nov 2025')

    cy.contains('Accommodation service')
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Complexity level')
      .should('contain', 'LOW COMPLEXITY')
      .should('contain', 'Service user has some capacity and means to secure')
      .should('contain', 'Desired outcomes')
      .should('contain', 'All barriers, as identified in the Service user action plan')
      .should('contain', 'Service user makes progress in obtaining accommodation')

    cy.contains('Social inclusion service')
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Complexity level')
      .should('contain', 'MEDIUM COMPLEXITY')
      .should('contain', 'Service user is at risk of homelessness/is homeless')
      .should('contain', 'Desired outcomes')
      .should('contain', 'Service user is helped to secure social or supported housing')
      .should('contain', 'Service user is helped to secure a tenancy in the private rented sector (PRS)')

    cy.contains(`Jenny Jones's responsible officer details`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Name')
      .should('contain', 'Bob Alice')
      .should('contain', 'Email address')
      .should('contain', 'bobalice@example.com')
      .should('contain', 'Team email address')
      .should('contain', 'r.m@digital.justice.gov.uk')

    cy.contains(`Jenny Jones's location and expected release date`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Location at time of referral')
      .should('contain', 'Custody')
      .should('contain', 'Current establishment')
      .should('contain', 'Expected release date')
      .should('contain', moment().add(1, 'days').format('YYYY-MM-DD'))

    cy.contains(`Personal details`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Jenny')
      .should('contain', 'English')
      .should('contain', 'Male')
      .should('contain', 'Agnostic')
      .should('contain', '1 Jan 1980 (43 years old)')

    cy.contains(`Address and contact details`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Flat 2 Test Walk')
      .should('contain', 'London')
      .should('contain', 'Phone number')
      .should('contain', '07123456789')
      .should('contain', 'Email address')
      .should('contain', 'jenny.jones@example.com')

    cy.contains(`Jenny Jones's risk information`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Who is at risk')
      .should('contain', 'some information for who is at risk')
      .should('contain', 'Concerns in relation to self-harm')
      .should('contain', 'some concerns for self harm')
      .should('contain', 'Additional information')
      .should('contain', 'They are low risk.')

    cy.contains(`Service user needs`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Identify needs')
      .should('contain', 'Alex is currently sleeping on her aunt’s sofa')
      .should('contain', 'Interpreter language')
      .should('contain', 'Spanish')
      .should('contain', 'Primary language')
      .should('contain', 'English')
  })

  it('probation practitioner views referral details when in community', () => {
    const page = pageFactory.pageContent([]).build()
    cy.stubGetSentReferralsForUserTokenPaged(page)

    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

    const personalWellbeingIntervention = interventionFactory.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build({
      caseDetail: {
        name: {
          firstName: 'Jenny',
          surname: 'Jones',
        },
        contactDetails: {
          emailAddress: 'jenny.jones@example.com',
          mobileNumber: '07123456789',
        },
      },
      conviction: {
        mainOffence: {
          category: 'Burglary',
          subCategory: 'Theft act, 1968',
        },
        sentence: {
          expectedEndDate: '2025-11-15',
        },
      },
    })

    const referral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.conviction.id,
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
        personCurrentLocationType: CurrentLocationType.community,
        expectedReleaseDate: null,
        expectedReleaseDateMissingReason: null,
        hasExpectedReleaseDate: null,
        ndeliusPPName: 'Bob Alice',
        ndeliusPPEmailAddress: 'bobalice@example.com',
        ndeliusPDU: 'Sheffield',
        ppName: null,
        ppEmailAddress: null,
        ppProbationOffice: 'London',
        ppPdu: 'London',
        hasValidDeliusPPDetails: true,
      },
    })

    cy.stubGetApprovedActionPlanSummaries(referral.id, [])

    const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'They are low risk.',
    })

    const deliusUser = ramDeliusUserFactory.build()

    const deliusServiceUser = conviction.caseDetail

    const prisons = prisonFactory.prisonList()

    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
    cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetConvictionByCrnAndId(referral.referral.serviceUser.crn, conviction.conviction.id, conviction)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
    cy.stubGetApprovedActionPlanSummaries(referral.id, [])
    cy.stubGetResponsibleOfficer(referral.referral.serviceUser.crn, deliusResponsibleOfficerFactory.build())
    cy.stubGetPrisons(prisons)

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
    cy.contains('15 Nov 2025')

    cy.contains('Accommodation service')
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Complexity level')
      .should('contain', 'LOW COMPLEXITY')
      .should('contain', 'Service user has some capacity and means to secure')
      .should('contain', 'Desired outcomes')
      .should('contain', 'All barriers, as identified in the Service user action plan')
      .should('contain', 'Service user makes progress in obtaining accommodation')

    cy.contains('Social inclusion service')
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Complexity level')
      .should('contain', 'MEDIUM COMPLEXITY')
      .should('contain', 'Service user is at risk of homelessness/is homeless')
      .should('contain', 'Desired outcomes')
      .should('contain', 'Service user is helped to secure social or supported housing')
      .should('contain', 'Service user is helped to secure a tenancy in the private rented sector (PRS)')

    cy.contains(`Jenny Jones's responsible officer details`).should('not.exist')

    cy.contains(`Jenny Jones's probation practitioner`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Name')
      .should('contain', 'Bob Alice')
      .should('contain', 'Email address')
      .should('contain', 'bobalice@example.com')
      .should('contain', 'Probation Office')
      .should('contain', 'London')

    cy.contains(`Jenny Jones's location and expected release date`).should('not.exist')

    cy.contains(`Jenny Jones's location`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Location at time of referral')
      .should('contain', 'Community')

    cy.contains(`Personal details`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Jenny')
      .should('contain', 'English')
      .should('contain', 'Male')
      .should('contain', 'Agnostic')
      .should('contain', '1 Jan 1980 (43 years old)')

    cy.contains(`Address and contact details`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Flat 2 Test Walk')
      .should('contain', 'London')
      .should('contain', 'Phone number')
      .should('contain', '07123456789')
      .should('contain', 'Email address')
      .should('contain', 'jenny.jones@example.com')

    cy.contains(`Jenny Jones's risk information`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Who is at risk')
      .should('contain', 'some information for who is at risk')
      .should('contain', 'Concerns in relation to self-harm')
      .should('contain', 'some concerns for self harm')
      .should('contain', 'Additional information')
      .should('contain', 'They are low risk.')

    cy.contains(`Service user needs`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Identify needs')
      .should('contain', 'Alex is currently sleeping on her aunt’s sofa')
      .should('contain', 'Interpreter language')
      .should('contain', 'Spanish')
      .should('contain', 'Primary language')
      .should('contain', 'English')
  })

  describe('probabation practitioner amends referral details', () => {
    it('probation practitioner amends the completion deadline', () => {
      const page = pageFactory.pageContent([]).build()
      cy.stubGetSentReferralsForUserTokenPaged(page)

      const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

      const personalWellbeingIntervention = interventionFactory.build({
        contractType: { code: 'PWB', name: 'Personal wellbeing' },
        serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
      })

      const conviction = caseConvictionFactory.build({
        caseDetail: {
          name: {
            firstName: 'Jenny',
            surname: 'Jones',
          },
          dateOfBirth: '1980-01-01',
          contactDetails: {
            emailAddress: 'jenny.jones@example.com',
            mobileNumber: '07123456789',
          },
        },
      })

      const referral = sentReferralFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: personalWellbeingIntervention.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          relevantSentenceId: conviction.conviction.id,
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

      const deliusUser = ramDeliusUserFactory.build()

      const deliusServiceUser = deliusServiceUserFactory.build({
        name: {
          firstName: 'Jenny',
          surname: 'Jones',
        },
        dateOfBirth: new Date(Date.parse('1980-01-01')),
        contactDetails: {
          emailAddress: 'jenny.jones@example.com',
          mobileNumber: '07123456789',
        },
      })

      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
      cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetConvictionByCrnAndId(referral.referral.serviceUser.crn, conviction.conviction.id, conviction)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
      cy.stubUpdateDesiredOutcomesForServiceCategory(referral.id, accommodationServiceCategory.id, referral)
      cy.stubGetApprovedActionPlanSummaries(referral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetResponsibleOfficer(referral.referral.serviceUser.crn, deliusResponsibleOfficerFactory.build())

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${referral.id}/details`)
      cy.contains('End of sentence date')
      cy.contains('Date intervention to be completed by')
      cy.contains('Maximum number of enforceable days')
      cy.visit(`/referrals/${referral.id}/completion-deadline`)
      cy.contains('What date does the Personal wellbeing intervention need to be completed by?')
      cy.contains('What is the reason for changing the completion date?').type('Random reason')
      cy.contains('Save and continue').click()
    })

    it('probation practitioner amends desired outcomes', () => {
      const page = pageFactory.pageContent([]).build()
      cy.stubGetSentReferralsForUserTokenPaged(page)

      const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

      const personalWellbeingIntervention = interventionFactory.build({
        contractType: { code: 'PWB', name: 'Personal wellbeing' },
        serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
      })

      const conviction = caseConvictionFactory.build({
        caseDetail: {
          name: {
            firstName: 'Jenny',
            surname: 'Jones',
          },
          dateOfBirth: '1980-01-01',
          contactDetails: {
            emailAddress: 'jenny.jones@example.com',
            mobileNumber: '07123456789',
          },
        },
      })

      const referral = sentReferralFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: personalWellbeingIntervention.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          relevantSentenceId: conviction.conviction.id,
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

      const deliusUser = ramDeliusUserFactory.build()

      const deliusServiceUser = deliusServiceUserFactory.build({
        name: {
          firstName: 'Jenny',
          surname: 'Jones',
        },
        dateOfBirth: new Date(Date.parse('1980-01-01')),
        contactDetails: {
          emailAddress: 'jenny.jones@example.com',
          mobileNumber: '07123456789',
        },
      })

      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
      cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetConvictionByCrnAndId(referral.referral.serviceUser.crn, conviction.conviction.id, conviction)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
      cy.stubUpdateDesiredOutcomesForServiceCategory(referral.id, accommodationServiceCategory.id, referral)
      cy.stubGetApprovedActionPlanSummaries(referral.id, [])
      cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
      cy.stubGetResponsibleOfficer(referral.referral.serviceUser.crn, deliusResponsibleOfficerFactory.build())

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${referral.id}/details`)

      cy.contains('Accommodation service')
        .parent()
        .parent()
        .children()
        .last()
        .children()
        .should('contain', 'Complexity level')
        .should('contain', 'Desired outcomes')
        .contains('Change')

      cy.get('#change-link-1').click()

      cy.location('pathname').should(
        'equal',
        `/probation-practitioner/referrals/${referral.id}/${accommodationServiceCategory.id}/update-desired-outcomes`
      )

      cy.contains('What are the desired outcomes for Accommodation?')

      cy.get('[data-cy=desired-outcomes]').within(() => {
        cy.get(':checkbox').last().check()
      })

      cy.contains('What is the reason for changing the desired outcomes?').type('Update Desired Outcomes')

      cy.contains('Save changes').click()

      cy.location('pathname').should('equal', `/probation-practitioner/referrals/${referral.id}/details`)
      cy.get('.govuk-notification-banner--success')
        .should('contain', 'Success')
        .should('contain', 'Referral changes saved')
        .contains('Close')
        .click()

      cy.get('.govuk-notification-banner--success').should('not.exist')
    })
  })

  describe('Returns to correct dashboard after user clicks back', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

    const personalWellbeingIntervention = interventionFactory.build({
      contractType: { code: 'PWB', name: 'Personal wellbeing' },
      serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
    })

    const conviction = caseConvictionFactory.build({
      caseDetail: {
        name: {
          firstName: 'Jenny',
          surname: 'Jones',
        },
        dateOfBirth: '1980-01-01',
        contactDetails: {
          emailAddress: 'jenny.jones@example.com',
          mobileNumber: '07123456789',
        },
      },
    })

    const referral = sentReferralFactory.build({
      sentAt: '2020-12-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        interventionId: personalWellbeingIntervention.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        relevantSentenceId: conviction.conviction.id,
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

    const deliusUser = ramDeliusUserFactory.build()

    const deliusServiceUser = deliusServiceUserFactory.build({
      name: {
        firstName: 'Jenny',
        surname: 'Jones',
      },
      dateOfBirth: new Date(Date.parse('1980-01-01')),
      contactDetails: {
        emailAddress: 'jenny.jones@example.com',
        mobileNumber: '07123456789',
      },
    })

    const sentReferrals = [
      sentReferralSummariesFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        assignedTo: null,
        serviceUser: { firstName: 'George', lastName: 'Michael' },
      }),
      sentReferralSummariesFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        assignedTo: {
          username: 'A. Caseworker',
          userId: '123',
          authSource: 'auth',
        },
        referenceNumber: 'ABCABCA2',
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        interventionTitle: "Women's Services - West Midlands",
      }),
    ]

    const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inThePast.build({
      durationInMinutes: 75,
      appointmentDeliveryType: 'PHONE_CALL',
    })
    const supplierAssessment = supplierAssessmentFactory.build({
      appointments: [appointmentWithNoFeedback],
      currentAppointmentId: appointmentWithNoFeedback.id,
    })

    const dashBoardTables = [
      {
        dashboardType: 'Open cases',
        pathname: 'open-cases',
      },
      {
        dashboardType: 'Unassigned cases',
        pathname: 'unassigned-cases',
      },
      {
        dashboardType: 'Completed cases',
        pathname: 'completed-cases',
      },
      {
        dashboardType: 'Cancelled cases',
        pathname: 'cancelled-cases',
      },
    ]

    dashBoardTables.forEach(table => {
      it(`returns to dashboard "${table.dashboardType}" when clicking back`, () => {
        const page = pageFactory
          .pageContent(sentReferrals)
          .build({ totalElements: sentReferrals.length, totalPages: 2, size: 1 })
        cy.stubGetSentReferralsForUserTokenPaged(page)

        cy.stubGetSentReferral(referral.id, referral)
        cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
        cy.stubGetApprovedActionPlanSummaries(referral.id, [])

        cy.stubGetSupplierAssessment(referral.id, supplierAssessment)
        cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetConvictionByCrnAndId(referral.referral.serviceUser.crn, conviction.conviction.id, conviction)
        cy.stubGetUserByUsername(deliusUser.username, deliusUser)
        cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)

        cy.login()

        cy.get('a').contains(table.dashboardType).click()
        cy.location('pathname').should('equal', `/probation-practitioner/dashboard/${table.pathname}`)

        cy.contains('Next').click()

        cy.contains('.govuk-table__row', 'George Michael').within(() => {
          cy.contains('View').click()
        })
        cy.location('pathname').should('equal', `/probation-practitioner/referrals/${referral.id}/progress`)

        cy.contains('Back').click()
        cy.location('pathname').should('equal', `/probation-practitioner/dashboard/${table.pathname}`)
        cy.location('search').should('equal', `?page=2`)
      })
    })
  })
})
