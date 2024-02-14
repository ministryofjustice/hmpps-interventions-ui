import moment from 'moment-timezone'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import sentReferralForSummaries from '../../testutils/factories/sentReferralSummaries'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import ramDeliusUserFactory from '../../testutils/factories/ramDeliusUser'
import deliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import hmppsAuthUserFactory from '../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../testutils/factories/endOfServiceReport'
import interventionFactory from '../../testutils/factories/intervention'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../testutils/factories/initialAssessmentAppointment'
import deliusOffenderManagerFactory from '../../testutils/factories/deliusOffenderManager'
import actionPlanActivityFactory from '../../testutils/factories/actionPlanActivity'
import pageFactory from '../../testutils/factories/page'
import deliusResponsibleOfficerFactory from '../../testutils/factories/deliusResponsibleOfficer'
import caseConvictionFactory from '../../testutils/factories/caseConviction'

describe('Service provider referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
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

    const conviction = caseConvictionFactory.build({
      caseDetail: {
        name: {
          forename: 'Jenny',
          surname: 'Jones',
        },
        contactDetails: {
          emailAddress: 'jenny.jones@example.com',
          mobileNumber: '07123456789',
          telephoneNumber: '0798765432',
          mainAddress: {
            buildingNumber: 'Flat 2',
            streetName: 'Test Walk',
            postcode: 'SW16 1AQ',
            town: 'London',
            district: 'City of London',
            county: 'Greater London',
          },
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

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          interventionId: socialInclusionIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
          serviceCategoryIds: [socialInclusionServiceCategory.id],
          isReferralReleasingIn12Weeks: null,
        },
      }),
      sentReferralFactory.build({
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: personalWellbeingIntervention.id,
          relevantSentenceId: conviction.conviction.id,
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
          isReferralReleasingIn12Weeks: null,
        },
      }),
    ]

    const sentReferralsSummaries = [
      sentReferralForSummaries.build({
        id: sentReferrals[0].id,
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        assignedTo: null,
        serviceUser: { firstName: 'George', lastName: 'Michael' },
        interventionTitle: 'Social Inclusion - West Midlands',
      }),
      sentReferralForSummaries.build({
        id: sentReferrals[1].id,
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        assignedTo: null,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        interventionTitle: 'Personal Wellbeing - West Midlands',
      }),
    ]

    const deliusUser = ramDeliusUserFactory.build()

    const referralToSelect = sentReferrals[1]

    const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'They are low risk.',
    })

    cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
    cy.stubGetIntervention(socialInclusionIntervention.id, socialInclusionIntervention)
    sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
    cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(sentReferralsSummaries).build())
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetConvictionByCrnAndId(referralToSelect.referral.serviceUser.crn, conviction.conviction.id, conviction)
    cy.stubGetSupplementaryRiskInformation(referralToSelect.supplementaryRiskId, supplementaryRiskInformation)
    cy.stubGetResponsibleOfficer(referralToSelect.referral.serviceUser.crn, deliusResponsibleOfficerFactory.build())

    cy.login()

    cy.get('h1').contains('My cases')
    cy.contains('All open cases').click()
    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          'Name/CRN': 'George Michael\n            X123456',
          'Referral number': 'ABCABCA1',
          'Intervention type': 'Social Inclusion - West Midlands',
          Caseworker: '',
          'Date received': '26 Jan 2021',
        },
        {
          'Name/CRN': 'Jenny Jones\n            X123456',
          'Referral number': 'ABCABCA2',
          'Intervention type': 'Personal Wellbeing - West Midlands',
          Caseworker: '',
          'Date received': '13 Dec 2020',
        },
      ])

    cy.contains('Jenny Jones').click()
    cy.location('pathname').should('equal', `/service-provider/referrals/${referralToSelect.id}/details`)
    cy.get('h2').contains('Who do you want to assign this referral to?')
    cy.contains('jenny.jones@example.com')
    cy.contains('07123456789')
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

    cy.contains(`Jenny Jones's probation practitioner`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Name')
      .should('contain', 'Bob Alice')
      .should('contain', 'Phone')
      .should('contain', '98454243243')
      .should('contain', 'Email address')
      .should('contain', 'b.a@xyz.com')
      .should('contain', 'Probation Office')
      .should('contain', 'London')
      .should('contain', 'Team phone')
      .should('contain', '044-2545453442')

    cy.contains(`Back-up contact for the referral`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Referring officer name')
      .should('contain', 'Bernard Beaks')
      .should('contain', 'Email address')
      .should('contain', 'bernard.beaks@justice.gov.uk')

    cy.contains(`Jenny Jones's location and expected release date`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Location at time of referral')
      .should('contain', 'Expected release date')
      .should('contain', moment().add(1, 'days').format('D MMM YYYY'))

    const yearsElapsed = moment().diff('1980-01-01', 'years')

    cy.contains(`Jenny Jones's personal details`)
      .parent()
      .parent()
      .children()
      .last()
      .children()
      .should('contain', 'Jenny')
      .should('contain', 'English')
      .should('contain', 'Male')
      .should('contain', 'Agnostic')
      .should('contain', `1 Jan 1980 (${yearsElapsed} years old)`)

    cy.contains(`Jenny Jones's address and contact details`)
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

    cy.contains(`Jenny Jones's needs and requirements`)
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

  describe('Assigning a referral to a caseworker', () => {
    it('User assigns a referral to a caseworker', () => {
      const intervention = interventionFactory.build()
      const conviction = caseConvictionFactory.build()

      const referralParams = {
        referral: {
          interventionId: intervention.id,
          serviceCategoryIds: [intervention.serviceCategories[0].id],
          relevantSentenceId: conviction.conviction.id,
        },
      }

      const referral = sentReferralFactory.build(referralParams)
      const deliusUser = ramDeliusUserFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()
      const hmppsAuthUser = hmppsAuthUserFactory.build({
        firstName: 'John',
        lastName: 'Smith',
        username: 'john.smith',
        email: 'john.smith@example.com',
      })
      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()

      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetSentReferralsForUserToken([referral])
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetAuthUserByEmailAddress([hmppsAuthUser])
      cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
      cy.stubAssignSentReferral(referral.id, referral)
      cy.stubGetConvictionByCrnAndId(referral.referral.serviceUser.crn, conviction.conviction.id, conviction)
      cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())
      cy.stubGetApprovedActionPlanSummaries(referral.id, [])
      cy.stubGetResponsibleOfficer(referral.referral.serviceUser.crn, deliusResponsibleOfficerFactory.build())

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)
      cy.contains('Once a caseworker has been assigned the initial assessment can be booked.')

      cy.contains('Referral details').click()

      cy.get('h2').contains('Who do you want to assign this referral to?')

      cy.get('#email').type('john.smith@example.com')
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

      const assignedReferralSummaries = sentReferralForSummaries.build({
        id: referral.id,
        assignedTo: { username: hmppsAuthUser.username },
      })

      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetSentReferralsForUserToken([assignedReferral])
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([assignedReferralSummaries]).build())

      cy.contains('Confirm assignment').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/assignment/confirmation`)
      cy.get('h1').contains('Caseworker assigned')

      cy.contains('Return to dashboard').click()

      cy.location('pathname').should('equal', `/service-provider/dashboard`)
      cy.contains('All open cases').click()
      cy.contains('john.smith')

      cy.visit(`/service-provider/referrals/${referral.id}/details`)
      cy.contains('This intervention is assigned to John Smith (john.smith@example.com).')

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)
      cy.contains('This intervention is assigned to John Smith (john.smith@example.com).')
    })

    it('User re-assigns a referral to a different caseworker', () => {
      const intervention = interventionFactory.build()
      const conviction = caseConvictionFactory.build()

      const referralParams = {
        referral: {
          interventionId: intervention.id,
          serviceCategoryIds: [intervention.serviceCategories[0].id],
          relevantSentenceId: conviction.conviction.id,
        },
      }

      const currentAssignee = hmppsAuthUserFactory.build({
        firstName: 'John',
        lastName: 'Smith',
        username: 'john.smith',
        email: 'john.smith@example.com',
      })
      const referral = sentReferralFactory
        .assigned()
        .build({ ...referralParams, assignedTo: { username: currentAssignee.username } })

      const assignedReferralSummaries = sentReferralForSummaries.build({
        id: referral.id,
        assignedTo: { username: currentAssignee.username },
      })

      const deliusUser = ramDeliusUserFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()
      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()

      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetSentReferralsForUserToken([referral])
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([assignedReferralSummaries]).build())
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetAuthUserByEmailAddress([currentAssignee])
      cy.stubGetAuthUserByUsername(currentAssignee.username, currentAssignee)
      cy.stubAssignSentReferral(referral.id, referral)
      cy.stubGetConvictionByCrnAndId(referral.referral.serviceUser.crn, conviction.conviction.id, conviction)
      cy.stubGetSupplementaryRiskInformation(referral.supplementaryRiskId, supplementaryRiskInformation)
      cy.stubGetResponsibleOfficer(referral.referral.serviceUser.crn, deliusResponsibleOfficerFactory.build())

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/details`)

      cy.contains('This intervention is assigned to John Smith (john.smith@example.com).')

      cy.get('h2').contains('Who do you want to assign this referral to?')

      const newAssignee = hmppsAuthUserFactory.build({
        firstName: 'Anna',
        lastName: 'Dawkins',
        username: 'anna.dawkins',
        email: 'anna.dawkins@example.com',
      })
      cy.stubGetAuthUserByEmailAddress([newAssignee])
      cy.stubGetAuthUserByUsername(newAssignee.username, newAssignee)

      cy.get('#email').type('anna.dawkins@example.com')
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

      const reAssignedReferralSummaries = sentReferralForSummaries
        .assigned()
        .build({ assignedTo: { username: newAssignee.username } })

      cy.stubGetSentReferral(reAssignedReferral.id, reAssignedReferral)
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([reAssignedReferralSummaries]).build())

      cy.contains('Confirm assignment').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/assignment/confirmation`)
      cy.get('h1').contains('Caseworker assigned')

      cy.visit(`/service-provider/referrals/${referral.id}/details`)
      cy.contains('This intervention is assigned to Anna Dawkins (anna.dawkins@example.com).')
    })
  })

  it('Displays an error when user creates an action plan and submits it for approval without a completed supplier assessment appointment', () => {
    const desiredOutcomes = [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service user makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service user is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ]

    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })
    const accommodationIntervention = interventionFactory.build({
      contractType: { code: 'SOC', name: 'Social inclusion' },
      serviceCategories: [serviceCategory],
    })

    const selectedDesiredOutcomesIds = [desiredOutcomes[0].id, desiredOutcomes[1].id]
    const referralParams = {
      referral: {
        interventionId: accommodationIntervention.id,
        serviceCategoryIds: [serviceCategory.id],
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: selectedDesiredOutcomesIds }],
      },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const deliusUser = ramDeliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const assignedReferral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username } })

    const assignedReferralSummaries = sentReferralForSummaries
      .assigned()
      .build({ assignedTo: { username: hmppsAuthUser.username } })

    const draftActionPlan = actionPlanFactory.justCreated(assignedReferral.id).build()
    const actionPlanAppointments = [
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 1 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 2 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 3 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 4 }),
    ]

    cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([assignedReferralSummaries]).build())
    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlan)
    cy.stubCreateDraftActionPlan(draftActionPlan)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
    cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
    cy.stubGetActionPlanAppointments(draftActionPlan.id, actionPlanAppointments)
    cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
    cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [])

    cy.login()

    cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
    cy.get('#action-plan-status').contains('Not submitted')
    cy.contains('Create action plan').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/1`)

    cy.contains('Add activity 1 to action plan')
    cy.contains('Referred outcomes for Alex')
    cy.contains(desiredOutcomes[0].description)
    cy.contains(desiredOutcomes[1].description)

    const draftActionPlanWithActivity = {
      ...draftActionPlan,
      activities: [
        {
          id: '1',
          description: 'Attend training course',
          createdAt: new Date().toISOString(),
        },
      ],
    }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithActivity)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithActivity)

    cy.get('#description').type('Attend training course')
    cy.contains('Save and add activity 1').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/2`)

    const draftActionPlanWithAllActivities = {
      ...draftActionPlanWithActivity,
      activities: [
        ...draftActionPlanWithActivity.activities,
        {
          id: '2',
          description: 'Create appointment with local authority',
          createdAt: new Date().toISOString(),
        },
      ],
    }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithAllActivities)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithAllActivities)

    cy.get('#description').type('Create appointment with local authority')
    cy.contains('Save and add activity 2').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/3`)

    cy.contains('Continue without adding other activities').click()

    const draftActionPlanWithNumberOfSessions = { ...draftActionPlanWithAllActivities, numberOfSessions: 4 }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithNumberOfSessions)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithNumberOfSessions)

    cy.contains('Add number of sessions for Alex’s action plan')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/number-of-sessions`)
    cy.contains('Number of sessions').type('4')

    cy.contains('Save and continue').click()

    const referralWithActionPlanId = { ...assignedReferral, actionPlanId: draftActionPlan.id }
    const submittedActionPlan = { ...draftActionPlanWithNumberOfSessions, submittedAt: new Date(2021, 7, 18) }

    cy.stubGetSentReferral(assignedReferral.id, referralWithActionPlanId)
    cy.stubSubmitActionPlan(draftActionPlan.id, submittedActionPlan)
    cy.stubGetActionPlan(draftActionPlan.id, submittedActionPlan)

    cy.contains('Confirm action plan')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/review`)
    cy.contains('Activity 1')
    cy.contains('Attend training course')
    cy.contains('Activity 2')
    cy.contains('Create appointment with local authority')
    cy.contains('Submit for approval').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/review`)
    cy.contains('There is a problem')
      .next()
      .contains(
        'You cannot submit an action plan yet. First you need to hold the supplier assessment appointment and then give feedback on it.'
      )
  })

  it('User creates an action plan and submits it for approval', () => {
    const desiredOutcomes = [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service user makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service user is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ]

    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })
    const accommodationIntervention = interventionFactory.build({
      contractType: { code: 'SOC', name: 'Social inclusion' },
      serviceCategories: [serviceCategory],
    })

    const selectedDesiredOutcomesIds = [desiredOutcomes[0].id, desiredOutcomes[1].id]
    const referralParams = {
      referral: {
        interventionId: accommodationIntervention.id,
        serviceCategoryIds: [serviceCategory.id],
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: selectedDesiredOutcomesIds }],
      },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const deliusUser = ramDeliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const assignedReferral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username } })

    const assignedReferralSummaries = sentReferralForSummaries
      .assigned()
      .build({ assignedTo: { username: hmppsAuthUser.username } })

    const draftActionPlan = actionPlanFactory.justCreated(assignedReferral.id).build()
    const actionPlanAppointments = [
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 1 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 2 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 3 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 4 }),
    ]

    cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([assignedReferralSummaries]).build())
    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlan)
    cy.stubCreateDraftActionPlan(draftActionPlan)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
    cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
    cy.stubGetActionPlanAppointments(draftActionPlan.id, actionPlanAppointments)
    cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.withAttendedAppointment.build())
    cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [])

    cy.login()

    cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
    cy.get('#action-plan-status').contains('Not submitted')
    cy.contains('Create action plan').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/1`)

    cy.contains('Add activity 1 to action plan')
    cy.contains('Referred outcomes for Alex')
    cy.contains(desiredOutcomes[0].description)
    cy.contains(desiredOutcomes[1].description)

    const draftActionPlanWithActivity = {
      ...draftActionPlan,
      activities: [
        {
          id: '1',
          description: 'Attend training course',
          createdAt: new Date().toISOString(),
        },
      ],
    }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithActivity)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithActivity)

    cy.get('#description').type('Attend training course')
    cy.contains('Save and add activity 1').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/2`)

    const draftActionPlanWithAllActivities = {
      ...draftActionPlanWithActivity,
      activities: [
        ...draftActionPlanWithActivity.activities,
        {
          id: '2',
          description: 'Create appointment with local authority',
          createdAt: new Date().toISOString(),
        },
      ],
    }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithAllActivities)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithAllActivities)

    cy.get('#description').type('Create appointment with local authority')
    cy.contains('Save and add activity 2').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/3`)

    cy.contains('Continue without adding other activities').click()

    const draftActionPlanWithNumberOfSessions = { ...draftActionPlanWithAllActivities, numberOfSessions: 4 }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithNumberOfSessions)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithNumberOfSessions)

    cy.contains('Add number of sessions for Alex’s action plan')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/number-of-sessions`)
    cy.contains('Number of sessions').type('4')

    cy.contains('Save and continue').click()

    const referralWithActionPlanId = { ...assignedReferral, actionPlanId: draftActionPlan.id }
    const submittedActionPlan = { ...draftActionPlanWithNumberOfSessions, submittedAt: new Date(2021, 7, 18) }

    cy.stubGetSentReferral(assignedReferral.id, referralWithActionPlanId)
    cy.stubSubmitActionPlan(draftActionPlan.id, submittedActionPlan)
    cy.stubGetActionPlan(draftActionPlan.id, submittedActionPlan)

    cy.contains('Confirm action plan')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/review`)
    cy.contains('Activity 1')
    cy.contains('Attend training course')
    cy.contains('Activity 2')
    cy.contains('Create appointment with local authority')
    cy.contains('Submit for approval').click()

    cy.contains('Action plan submitted for approval')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/confirmation`)
    cy.contains('Return to service progress').click()

    cy.location('pathname').should('equal', `/service-provider/referrals/${assignedReferral.id}/progress`)
    cy.get('#action-plan-status').contains('Awaiting approval')
    cy.get('.action-plan-submitted-date').contains('18 August 2021')
  })

  describe('editing a submitted action plan', () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const accommodationIntervention = interventionFactory.build({
      contractType: { code: 'SOC', name: 'Social inclusion' },
      serviceCategories: [serviceCategory],
    })

    const actionPlanId = '2763d6e8-1847-4191-9c3f-0eea9a3b0c41'
    const referralParams = {
      referral: {
        interventionId: accommodationIntervention.id,
        serviceCategoryIds: [serviceCategory.id],
        actionPlanId,
      },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const deliusUser = ramDeliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const assignedReferral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username }, actionPlanId })

    const assignedReferralSummaries = sentReferralForSummaries
      .assigned()
      .build({ assignedTo: { username: hmppsAuthUser.username } })

    const appointments = [
      actionPlanAppointmentFactory.build({
        sessionNumber: 1,
        appointmentTime: '2021-03-24T09:02:02Z',
        durationInMinutes: 75,
        appointmentDeliveryType: 'PHONE_CALL',
      }),
      actionPlanAppointmentFactory.build({
        sessionNumber: 2,
        appointmentTime: '2021-03-31T09:02:02Z',
        durationInMinutes: 75,
        appointmentDeliveryType: 'PHONE_CALL',
      }),
    ]

    beforeEach(() => {
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([assignedReferralSummaries]).build())
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
      cy.login()
    })

    describe('User creates a new draft action plan but does not submit it', () => {
      it('the referral progress page still shows sessions from the most recently approved action plan', () => {
        const draftActionPlan = actionPlanFactory.justCreated(assignedReferral.id).build({
          id: actionPlanId,
        })
        const approvedActionPlan = actionPlanFactory.approved(assignedReferral.id).build({
          activities: [actionPlanActivityFactory.build({ id: '1', description: 'First activity version 1' })],
        })

        cy.stubGetActionPlan(draftActionPlan.id, draftActionPlan)
        cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
          {
            id: approvedActionPlan.id,
            submittedAt: approvedActionPlan.submittedAt,
            approvedAt: approvedActionPlan.approvedAt,
          },
        ])

        cy.stubGetActionPlanAppointments(approvedActionPlan.id, appointments)
        cy.stubGetActionPlanAppointment(approvedActionPlan.id, 1, appointments[0])
        cy.stubGetActionPlanAppointment(approvedActionPlan.id, 2, appointments[1])

        cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
        cy.get('#action-plan-status').contains('In draft')
        cy.contains('Session 1')
        cy.contains('Session 2')
      })
    })

    it('User edits an unapproved action plan and submits it for approval', () => {
      const activityId = '1'
      const submittedActionPlan = actionPlanFactory.submitted(assignedReferral.id).build({
        referralId: assignedReferral.id,
        id: actionPlanId,
        activities: [actionPlanActivityFactory.build({ id: activityId, description: 'First activity version 1' })],
        submittedAt: '2021-08-19T11:03:47.061Z',
      })
      cy.stubGetActionPlan(submittedActionPlan.id, submittedActionPlan)
      cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [])
      cy.stubGetActionPlanAppointments(submittedActionPlan.id, [])
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.withAttendedAppointment.build())

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.get('#action-plan-status').contains('Awaiting approval')
      cy.contains('19 August 2021')
      cy.contains('View action plan').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${assignedReferral.id}/action-plan`)

      cy.contains('Edit action plan').click()
      cy.contains('Are you sure you want to change the action plan while it is being reviewed?')
      cy.stubCreateDraftActionPlan(submittedActionPlan)
      cy.stubGetSentReferral(submittedActionPlan.referralId, assignedReferral)

      cy.contains('Confirm and continue').click()

      const activity = actionPlanActivityFactory.build({ id: activityId, description: 'First activity version 2' })

      const actionPlanWithUpdatedActivities = actionPlanFactory.build({
        ...submittedActionPlan,
        activities: [activity],
      })

      cy.contains('First activity version 1').clear()
      cy.contains('First activity version 1').type('First activity version 2')
      cy.stubUpdateActionPlanActivity(submittedActionPlan.id, activity.id, actionPlanWithUpdatedActivities)
      cy.contains('Save and add activity 1').click()

      cy.contains('Continue without adding other activities').click()

      cy.get('#number-of-sessions').clear()
      cy.get('#number-of-sessions').type('5')

      const actionPlanWithUpdatedSessions = actionPlanFactory.build({
        ...actionPlanWithUpdatedActivities,
        numberOfSessions: 5,
      })

      cy.stubUpdateDraftActionPlan(actionPlanWithUpdatedActivities.id, actionPlanWithUpdatedSessions)
      cy.stubGetActionPlan(actionPlanWithUpdatedSessions.id, {
        ...actionPlanWithUpdatedSessions,
        submittedAt: '2021-08-20T11:03:47.061Z',
      })
      cy.contains('Save and continue').click()

      cy.contains('First activity version 2')
      cy.contains('Suggested number of sessions: 5')

      cy.stubSubmitActionPlan(actionPlanWithUpdatedSessions.id, actionPlanWithUpdatedSessions)

      cy.contains('Submit for approval').click()

      cy.contains('Action plan submitted for approval')
      cy.location('pathname').should(
        'equal',
        `/service-provider/action-plan/${actionPlanWithUpdatedSessions.id}/confirmation`
      )
      cy.contains('Return to service progress').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.get('#action-plan-status').contains('Awaiting approval')
      cy.contains('20 August 2021')
    })

    it('User edits an approved action plan and submits it for approval', () => {
      const activityId = '1'
      const approvedActionPlan = actionPlanFactory.approved(assignedReferral.id).build({
        referralId: assignedReferral.id,
        id: actionPlanId,
        activities: [actionPlanActivityFactory.build({ id: activityId, description: 'First activity version 1' })],
        submittedAt: '2021-08-19T11:03:47.061Z',
      })
      cy.stubGetActionPlan(approvedActionPlan.id, approvedActionPlan)
      cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
        {
          id: approvedActionPlan.id,
          submittedAt: approvedActionPlan.submittedAt,
          approvedAt: approvedActionPlan.approvedAt,
        },
      ])
      cy.stubGetActionPlanAppointments(approvedActionPlan.id, [])

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.get('#action-plan-status').contains('Approved')
      cy.contains('19 August 2021')
      cy.contains('View action plan').click()

      cy.contains('Create action plan').click()
      cy.contains('Are you sure you want to create a new action plan?')

      const newActionPlanVersion = actionPlanFactory.build({
        referralId: assignedReferral.id,
        activities: approvedActionPlan.activities,
        numberOfSessions: approvedActionPlan.numberOfSessions,
      })

      cy.stubCreateDraftActionPlan(newActionPlanVersion)
      cy.stubGetActionPlan(newActionPlanVersion.id, newActionPlanVersion)
      cy.stubGetSentReferral(newActionPlanVersion.referralId, assignedReferral)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.withAttendedAppointment.build())

      cy.contains('Confirm and continue').click()

      const activity = actionPlanActivityFactory.build({ id: activityId, description: 'First activity version 2' })

      const actionPlanWithUpdatedActivities = actionPlanFactory.build({
        ...newActionPlanVersion,
        activities: [activity],
      })

      cy.contains('First activity version 1').clear()
      cy.contains('First activity version 1').type('First activity version 2')
      cy.stubUpdateActionPlanActivity(newActionPlanVersion.id, activity.id, actionPlanWithUpdatedActivities)
      cy.contains('Save and add activity 1').click()

      cy.contains('Continue without adding other activities').click()

      cy.get('#number-of-sessions').clear()
      cy.get('#number-of-sessions').type('5')

      const actionPlanWithUpdatedSessions = actionPlanFactory.build({
        ...actionPlanWithUpdatedActivities,
        numberOfSessions: 5,
      })

      cy.stubUpdateDraftActionPlan(actionPlanWithUpdatedActivities.id, actionPlanWithUpdatedSessions)
      const submittedActionPlanVersionTwo = actionPlanFactory.build({
        ...actionPlanWithUpdatedSessions,
        submittedAt: '2021-08-20T11:03:47.061Z',
      })
      cy.stubGetActionPlan(actionPlanWithUpdatedSessions.id, submittedActionPlanVersionTwo)

      cy.contains('Save and continue').click()

      cy.contains('First activity version 2')
      cy.contains('Suggested number of sessions: 5')

      cy.stubSubmitActionPlan(submittedActionPlanVersionTwo.id, submittedActionPlanVersionTwo)

      cy.contains('Submit for approval').click()

      cy.contains('Action plan submitted for approval')
      cy.location('pathname').should(
        'equal',
        `/service-provider/action-plan/${submittedActionPlanVersionTwo.id}/confirmation`
      )

      cy.stubGetSentReferral(assignedReferral.id, {
        ...assignedReferral,
        actionPlanId: actionPlanWithUpdatedSessions.id,
      })
      cy.stubGetActionPlanAppointments(actionPlanWithUpdatedSessions.id, [])

      cy.contains('Return to service progress').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.get('#action-plan-status').contains('Awaiting approval')
      cy.contains('20 August 2021')
    })
  })

  describe('User schedules and views an action plan appointment', () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build()
    const referral = sentReferralFactory.build({
      referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
    })
    const actionPlan = actionPlanFactory.build({ referralId: referral.id })
    const appointment = actionPlanAppointmentFactory
      .newlyCreated()
      .build({ referralId: referral.id, actionPlanId: actionPlan.id, sessionNumber: 1 })
    const deliusServiceUser = deliusServiceUserFactory.build()

    beforeEach(() => {
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, appointment)
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())
      cy.login()
    })

    describe('with valid inputs and an appointment in the future', () => {
      describe('when booking for an In-Person Meeting - Other Location', () => {
        it('should present no errors and display scheduled appointment', () => {
          const tomorrow = moment.tz('09:02:00', 'HH:mm:ss', 'Europe/London').add(1, 'days')
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)
          cy.get('#date-day').type(tomorrow.format('D'))
          cy.get('#date-month').type(tomorrow.format('M'))
          cy.get('#date-year').type(tomorrow.format('YYYY'))
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('Group session').click()
          cy.contains('In-person meeting - Other locations').click()
          cy.get('#method-other-location-address-line-1').type('Harmony Living Office, Room 4')
          cy.get('#method-other-location-address-line-2').type('44 Bouverie Road')
          cy.get('#method-other-location-address-town-or-city').type('Blackpool')
          cy.get('#method-other-location-address-county').type('Lancashire')
          cy.get('#method-other-location-address-postcode').type('SY4 0RE')

          const scheduledAppointment = actionPlanAppointmentFactory.build({
            ...appointment,
            appointmentTime: tomorrow.format(),
            durationInMinutes: 75,
            sessionType: 'GROUP',
            appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
            appointmentDeliveryAddress: {
              firstAddressLine: 'Harmony Living Office, Room 4',
              secondAddressLine: '44 Bouverie Road',
              townOrCity: 'Blackpool',
              county: 'Lancashire',
              postCode: 'SY4 0RE',
            },
          })
          cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
          cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

          cy.contains('Save and continue').click()

          cy.get('h1').contains('Confirm session 1 details')
          cy.contains(tomorrow.format('D MMMM YYYY'))
          cy.contains('9:02am to 10:17am')
          cy.contains('In-person meeting')
          cy.contains('Harmony Living Office, Room 4')
          cy.contains('44 Bouverie Road')
          cy.contains('Blackpool')
          cy.contains('Lancashire')
          cy.contains('SY4 0RE')

          cy.get('button').contains('Confirm').click()

          cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)

          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)

          cy.get('#date-day').should('have.value', tomorrow.format('D'))
          cy.get('#date-month').should('have.value', tomorrow.format('M'))
          cy.get('#date-year').should('have.value', tomorrow.format('YYYY'))
          cy.get('#time-hour').should('have.value', '9')
          cy.get('#time-minute').should('have.value', '02')
          // https://stackoverflow.com/questions/51222840/cypress-io-how-do-i-get-text-of-selected-option-in-select
          cy.get('#time-part-of-day').find('option:selected').should('have.text', 'AM')
          cy.get('#duration-hours').should('have.value', '1')
          cy.get('#duration-minutes').should('have.value', '15')
          cy.contains('Group session').parent().find('input').should('be.checked')
          cy.get('#method-other-location-address-line-1').should('have.value', 'Harmony Living Office, Room 4')
          cy.get('#method-other-location-address-line-2').should('have.value', '44 Bouverie Road')
          cy.get('#method-other-location-address-town-or-city').should('have.value', 'Blackpool')
          cy.get('#method-other-location-address-county').should('have.value', 'Lancashire')
          cy.get('#method-other-location-address-postcode').should('have.value', 'SY4 0RE')
        })

        describe('and their chosen date causes a clash of appointments', () => {
          it('the user is able to amend their chosen date and re-submit', () => {
            const tomorrow = moment.tz('09:02:00', 'HH:mm:ss', 'Europe/London').add(1, 'days')
            const rescheduledDate = moment('09:02:00', 'HH:mm:ss').add(2, 'days')
            cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)
            cy.get('#date-day').type(tomorrow.format('D'))
            cy.get('#date-month').type(tomorrow.format('M'))
            cy.get('#date-year').type(tomorrow.format('YYYY'))
            cy.get('#time-hour').type('9')
            cy.get('#time-minute').type('02')
            cy.get('#time-part-of-day').select('AM')
            cy.get('#duration-hours').type('1')
            cy.get('#duration-minutes').type('15')
            cy.contains('Group session').click()
            cy.contains('In-person meeting - Other locations').click()
            cy.get('#method-other-location-address-line-1').type('Harmony Living Office, Room 4')
            cy.get('#method-other-location-address-line-2').type('44 Bouverie Road')
            cy.get('#method-other-location-address-town-or-city').type('Blackpool')
            cy.get('#method-other-location-address-county').type('Lancashire')
            cy.get('#method-other-location-address-postcode').type('SY4 0RE')

            cy.contains('Save and continue').click()

            cy.get('h1').contains('Confirm session 1 details')
            cy.contains(tomorrow.format('D MMMM YYYY'))
            cy.contains('9:02am to 10:17am')
            cy.contains('In-person meeting')
            cy.contains('Harmony Living Office, Room 4')
            cy.contains('44 Bouverie Road')
            cy.contains('Blackpool')
            cy.contains('Lancashire')
            cy.contains('SY4 0RE')

            cy.stubUpdateActionPlanAppointmentClash(actionPlan.id, 1)

            cy.get('button').contains('Confirm').click()

            cy.contains('The proposed date and time you selected clashes with another appointment.')

            cy.get('h1').contains('Add session 1 details')
            cy.get('#date-day').should('have.value', tomorrow.format('D'))
            cy.get('#date-month').should('have.value', tomorrow.format('M'))
            cy.get('#date-year').should('have.value', tomorrow.format('YYYY'))
            cy.get('#time-hour').should('have.value', '9')
            cy.get('#time-minute').should('have.value', '02')
            cy.get('#time-part-of-day').get('[selected]').should('have.text', 'AM')
            cy.get('#duration-hours').should('have.value', '1')
            cy.get('#duration-minutes').should('have.value', '15')
            cy.get('#meeting-method-meeting-other').should('be.checked')
            cy.get('#method-other-location-address-line-1').should('have.value', 'Harmony Living Office, Room 4')
            cy.get('#method-other-location-address-line-2').should('have.value', '44 Bouverie Road')
            cy.get('#method-other-location-address-town-or-city').should('have.value', 'Blackpool')
            cy.get('#method-other-location-address-county').should('have.value', 'Lancashire')
            cy.get('#method-other-location-address-postcode').should('have.value', 'SY4 0RE')

            cy.get('#date-day').clear()
            cy.get('#date-day').type(rescheduledDate.format('D'))
            cy.get('#date-month').clear()
            cy.get('#date-month').type(rescheduledDate.format('M'))
            cy.get('#date-year').clear()
            cy.get('#date-year').type(rescheduledDate.format('YYYY'))

            cy.contains('Save and continue').click()

            const scheduledAppointment = actionPlanAppointmentFactory.build({
              ...appointment,
              appointmentTime: rescheduledDate.format(),
              durationInMinutes: 75,
              sessionType: 'GROUP',
              appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
              appointmentDeliveryAddress: {
                firstAddressLine: 'Harmony Living Office, Room 4',
                secondAddressLine: '44 Bouverie Road',
                townOrCity: 'Blackpool',
                county: 'Lancashire',
                postCode: 'SY4 0RE',
              },
            })
            cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
            cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

            cy.get('h1').contains('Confirm session 1 details')
            cy.get('button').contains('Confirm').click()

            cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
          })
        })
      })

      describe('when booking for an In-Person Meeting - NPS Location', () => {
        it('should present no errors and display scheduled appointment', () => {
          const tomorrow = moment.tz('09:02:00', 'HH:mm:ss', 'Europe/London').add(1, 'days')
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)
          cy.get('#date-day').type(tomorrow.format('D'))
          cy.get('#date-month').type(tomorrow.format('M'))
          cy.get('#date-year').type(tomorrow.format('YYYY'))
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('Group session').click()
          cy.contains('In-person meeting - NPS offices').click()
          cy.get('#delius-office-location-code').select('Blackpool: Blackpool Probation Office')

          const scheduledAppointment = actionPlanAppointmentFactory.build({
            ...appointment,
            appointmentTime: tomorrow.format(),
            durationInMinutes: 75,
            sessionType: 'GROUP',
            appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
            appointmentDeliveryAddress: null,
            npsOfficeCode: 'CRS0105',
          })
          cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
          cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

          cy.contains('Save and continue').click()

          cy.get('h1').contains('Confirm session 1 details')
          cy.contains(tomorrow.format('D MMMM YYYY'))
          cy.contains('9:02am to 10:17am')
          cy.contains('In-person meeting (probation office)')

          cy.get('button').contains('Confirm').click()

          cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
          // TODO: Add checks for NPS Office address on this page

          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)

          cy.get('#date-day').should('have.value', tomorrow.format('D'))
          cy.get('#date-month').should('have.value', tomorrow.format('M'))
          cy.get('#date-year').should('have.value', tomorrow.format('YYYY'))
          cy.get('#time-hour').should('have.value', '9')
          cy.get('#time-minute').should('have.value', '02')
          // https://stackoverflow.com/questions/51222840/cypress-io-how-do-i-get-text-of-selected-option-in-select
          cy.get('#time-part-of-day').find('option:selected').should('have.text', 'AM')
          cy.get('#duration-hours').should('have.value', '1')
          cy.get('#duration-minutes').should('have.value', '15')
          cy.contains('Group session').parent().find('input').should('be.checked')
          cy.get('#delius-office-location-code option:selected').should(
            'have.text',
            'Blackpool: Blackpool Probation Office'
          )
        })
      })
    })

    describe('with valid inputs and an appointment in the past', () => {
      describe('when booking for a phone call', () => {
        describe('earlier today', () => {
          it('takes the user through the feedback form upon appointment confirmation', () => {
            cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)

            // schedule page
            const today = new Date()
            cy.get('#date-day').type(today.getDate().toString())
            cy.get('#date-month').type((today.getMonth() + 1).toString())
            cy.get('#date-year').type(today.getFullYear().toString())
            cy.get('#time-hour').type('0')
            cy.get('#time-minute').type('0')
            cy.get('#time-part-of-day').select('AM')
            cy.get('#duration-hours').type('1')
            cy.get('#duration-minutes').type('15')
            cy.contains('1:1').click()
            cy.contains('Phone call').click()

            cy.contains('Save and continue').click()

            // schedule check your answers page
            cy.get('h1').contains('Confirm session 1 details')
            cy.contains("You've chosen a date and time in the past")
            cy.contains('Midnight to 1:15am')
            cy.contains('Phone call')

            cy.get('button').contains('Confirm').click()

            // Attendance page

            cy.get('[id=didSessionHappenYesRadio]').click()
            cy.contains('Save and continue').click()

            cy.get('[id=wasLateNoRadio]').click()
            cy.contains('What did you do in the session?').type('Discussed accommodation')
            cy.contains('Add details about what you did, anything that was achieved and what came out of the session.')
            cy.contains('How did Alex River respond to the session?').type('Engaged well')
            cy.contains(
              'Add whether Alex River seemed engaged, including any progress or positive changes. This helps the probation practitioner to support them.'
            )
            cy.get('input[name="notify-probation-practitioner"][value="no"]').click()

            cy.contains('Save and continue').click()

            cy.contains('Confirm session feedback')

            const scheduledAppointment = actionPlanAppointmentFactory.build({
              ...appointment,
              appointmentTime: '2021-03-24T09:02:02Z',
              durationInMinutes: 75,
              sessionType: 'ONE_TO_ONE',
              appointmentDeliveryType: 'PHONE_CALL',
              appointmentDeliveryAddress: null,
              npsOfficeCode: null,
              appointmentFeedback: {
                attendanceFeedback: {
                  attended: 'yes',
                  didSessionHappen: true,
                },
                sessionFeedback: {
                  late: false,
                  sessionSummary: 'stub session summary',
                  sessionResponse: 'stub session response',
                  notifyProbationPractitioner: false,
                },
                submitted: true,
                submittedBy: {
                  firstName: 'Case',
                  lastName: 'Worker',
                  username: 'case.worker',
                },
              },
            })

            const accommodationIntervention = interventionFactory.build({
              contractType: { code: 'SOC', name: 'Social inclusion' },
              serviceCategories: [serviceCategory],
            })
            const serviceProvider = hmppsAuthUserFactory.build({
              firstName: 'Case',
              lastName: 'Worker',
              username: 'case.worker',
            })
            const referralParams = {
              id: '2',
              referral: { interventionId: accommodationIntervention.id, serviceCategoryIds: [serviceCategory.id] },
            }

            const assignedReferral = sentReferralFactory.assigned().build({
              ...referralParams,
              assignedTo: { username: serviceProvider.username },
              actionPlanId: actionPlan.id,
            })

            cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
              { id: actionPlan.id, submittedAt: actionPlan.submittedAt, approvedAt: actionPlan.approvedAt },
            ])
            cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
            cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
            cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
            cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)
            cy.stubGetActionPlan(actionPlan.id, actionPlan)
            cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
            cy.stubGetActionPlanAppointments(actionPlan.id, [scheduledAppointment])
            cy.stubGetActionPlanAppointment(actionPlan.id, 1, scheduledAppointment)
            cy.stubGetActionPlanAppointment(actionPlan.id, 2, scheduledAppointment)
            cy.stubUpdateActionPlanAppointment(actionPlan.id, 1, scheduledAppointment)
            cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
              { id: actionPlan.id, submittedAt: actionPlan.submittedAt, approvedAt: actionPlan.approvedAt },
            ])

            cy.get('form').contains('Confirm').click()

            cy.contains('Session feedback added')
            cy.contains('The probation practitioner will be able to view the feedback in the service.')
          })
        })
      })
    })

    describe('with invalid inputs', () => {
      describe("when the user doesn't select a session type", () => {
        it('should show an error', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('In-person meeting').click()
          cy.contains('Save and continue').click()
          cy.contains('There is a problem').next().contains('Select the session type')
        })
      })

      describe("when the user doesn't select meeting method", () => {
        it('should show an error', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('1:1').click()
          cy.contains('Save and continue').click()
          cy.contains('There is a problem').next().contains('Select a meeting method')
        })
      })

      describe("when the user doesn't enter an address", () => {
        it('should show an error', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/start`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('1:1').click()
          cy.contains('In-person meeting - Other locations').click()
          cy.contains('Save and continue').click()
          cy.contains('There is a problem').next().contains('Enter a value for address line 1')
          cy.contains('There is a problem').next().contains('Enter a postcode')
        })
      })
    })
  })

  describe('Recording post session feedback', () => {
    it('user records the Service user as having attended, and fills out session feedback screen', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const accommodationIntervention = interventionFactory.build({
        contractType: { code: 'SOC', name: 'Social inclusion' },
        serviceCategories: [serviceCategory],
      })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { interventionId: accommodationIntervention.id, serviceCategoryIds: [serviceCategory.id] },
      }
      const deliusServiceUser = deliusServiceUserFactory.build()
      const probationPractitioner = ramDeliusUserFactory.build({
        name: {
          forename: 'John',
          surname: 'Smith',
        },
        username: 'john.smith',
      })
      const serviceProvider = hmppsAuthUserFactory.build({
        firstName: 'Case',
        lastName: 'Worker',
        username: 'case.worker',
      })

      const actionPlan = actionPlanFactory.approved().build({
        referralId: referralParams.id,
        numberOfSessions: 4,
      })

      const appointments = [
        actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentTime: '2021-03-24T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 2,
          appointmentTime: '2021-03-31T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
      ]

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: serviceProvider.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
      cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)

      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
        { id: actionPlan.id, submittedAt: actionPlan.submittedAt, approvedAt: actionPlan.approvedAt },
      ])
      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      const appointmentWithAttendanceRecorded = {
        ...appointments[0],
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'yes',
            didSessionHappen: true,
          },
        },
      }

      const appointmentWithSessionFeedbackRecorded = actionPlanAppointmentFactory.build({
        ...appointments[0],
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'yes',
            didSessionHappen: true,
          },
          sessionFeedback: {
            late: false,
            sessionSummary: 'Discussed accommodation',
            sessionResponse: 'Engaged well',
            notifyProbationPractitioner: false,
          },
        },
      })

      const appointmentWithSubmittedFeedback = actionPlanAppointmentFactory.build({
        ...appointmentWithSessionFeedbackRecorded,
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'yes',
            didSessionHappen: true,
          },
          sessionFeedback: {
            late: false,
            sessionSummary: 'Discussed accommodation',
            sessionResponse: 'Engaged well',
            notifyProbationPractitioner: false,
          },
          submitted: true,
        },
      })

      cy.login()

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

      cy.contains('Give feedback').click()

      cy.get('[id=didSessionHappenYesRadio]').click()

      cy.stubRecordActionPlanAppointmentAttendance(
        assignedReferral.id,
        appointments[0].appointmentId,
        appointmentWithAttendanceRecorded
      )

      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithAttendanceRecorded)

      cy.contains('Save and continue').click()

      cy.contains('You told us that the session happened')

      cy.get('[id=wasLateNoRadio]').click()
      cy.contains('What did you do in the session?').type('Discussed accommodation')
      cy.contains('Add details about what you did, anything that was achieved and what came out of the session.')
      cy.contains('How did Alex River respond to the session?').type('Engaged well')
      cy.contains(
        'Add whether Alex River seemed engaged, including any progress or positive changes. This helps the probation practitioner to support them.'
      )

      cy.get('input[name="notify-probation-practitioner"][value="no"]').click()

      cy.stubRecordActionPlanAppointmentSessionFeedback(
        assignedReferral.id,
        appointments[0].appointmentId,
        appointmentWithSessionFeedbackRecorded
      )

      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithSessionFeedbackRecorded)

      cy.stubRecordActionPlanAppointmentSessionFeedback(
        assignedReferral.id,
        appointments[0].appointmentId,
        appointmentWithSessionFeedbackRecorded
      )
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithSessionFeedbackRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Confirm session feedback')

      cy.stubSubmitActionPlanSessionFeedback(
        assignedReferral.id,
        appointments[0].appointmentId,
        appointmentWithSubmittedFeedback
      )
      const updatedAppointments = [appointmentWithSubmittedFeedback, appointments[1]]
      cy.stubGetActionPlanAppointments(actionPlan.id, updatedAppointments)

      cy.get('form').contains('Confirm').click()

      cy.contains('Session feedback added')
      cy.contains('The probation practitioner will be able to view the feedback in the service.')
    })

    it('user records the Service user as having not attended', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const intervention = interventionFactory.build({
        contractType: { code: 'ACC', name: 'accommodation' },
        serviceCategories: [serviceCategory],
      })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { interventionId: intervention.id, serviceCategoryIds: [serviceCategory.id] },
      }
      const deliusServiceUser = deliusServiceUserFactory.build()
      const probationPractitioner = ramDeliusUserFactory.build({
        name: {
          forename: 'John',
          surname: 'Smith',
        },
        username: 'john.smith',
      })
      const serviceProvider = hmppsAuthUserFactory.build({
        firstName: 'Case',
        lastName: 'Worker',
        username: 'case.worker',
      })
      const actionPlan = actionPlanFactory.submitted().build({
        referralId: referralParams.id,
        numberOfSessions: 4,
      })

      const appointments = [
        actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentTime: '2021-03-24T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 2,
          appointmentTime: '2021-03-31T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
      ]

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: serviceProvider.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
      cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)

      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
        { id: actionPlan.id, submittedAt: actionPlan.submittedAt, approvedAt: actionPlan.approvedAt },
      ])
      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      const appointmentWithAttendanceRecorded = {
        ...appointments[0],
        appointmentFeedback: {
          attendanceFeedback: {
            didSessionHappen: false,
            attended: 'no',
          },
          sessionFeedback: {
            sessionSummary: null,
            sessionResponse: null,
            notifyProbationPractitioner: null,
          },
        },
      }

      const appointmentWithSessionFeedbackRecorded = actionPlanAppointmentFactory.build({
        ...appointments[0],
        appointmentFeedback: {
          attendanceFeedback: {
            didSessionHappen: false,
            attended: 'no',
          },
          sessionFeedback: {
            noAttendanceInformation: 'They did not attend and I phoned them.',
            notifyProbationPractitioner: false,
          },
        },
      })

      const appointmentWithSubmittedFeedback = {
        ...appointmentWithAttendanceRecorded,
        appointmentFeedback: {
          attendanceFeedback: {
            didSessionHappen: false,
            attended: 'no',
          },
          sessionFeedback: {
            noAttendanceInformation: 'They did not attend and I phoned them.',
            notifyProbationPractitioner: false,
          },
          submitted: true,
        },
      }

      cy.login()

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

      cy.contains('Give feedback').click()

      cy.get('[id=didSessionHappenNoRadio]').click()
      cy.get('[id=attendedNoRadio]').click()

      cy.stubRecordActionPlanAppointmentAttendance(
        assignedReferral.id,
        appointments[0].appointmentId,
        appointmentWithAttendanceRecorded
      )

      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithAttendanceRecorded)

      cy.contains('Save and continue').click()
      cy.location('pathname').should(
        'equal',
        `/service-provider/action-plan/${actionPlan.id}/appointment/${appointments[0].appointmentId}/post-session-feedback/no-session`
      )

      cy.contains('Add anything you know about why they did not attend and how you tried to contact them').type(
        'They did not attend and I phoned them.'
      )
      cy.contains('Does the probation practitioner need to be notified about any issues?')
      cy.get('[id=noNotifyPPRadio]').click()

      cy.stubRecordActionPlanAppointmentSessionFeedback(
        assignedReferral.id,
        appointments[0].appointmentId,
        appointmentWithSessionFeedbackRecorded
      )
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithSessionFeedbackRecorded)

      cy.contains('Save and continue').click()
      cy.location('pathname').should(
        'equal',
        `/service-provider/action-plan/${actionPlan.id}/appointment/${appointments[0].appointmentId}/post-session-feedback/check-your-answers`
      )
      cy.contains('Confirm session feedback')
      cy.contains('Session details')
      cy.contains('Session attendance')
      cy.contains('Session feedback')

      cy.stubSubmitActionPlanSessionFeedback(
        assignedReferral.id,
        appointments[0].appointmentId,
        appointmentWithSubmittedFeedback
      )

      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)

      cy.get('form').contains('Confirm').click()

      cy.contains('Session feedback added')

      cy.location('pathname').should('equal', `/service-provider/referrals/${assignedReferral.id}/progress`)
    })

    it('user records the Service user as having not attended, and skips session feedback screen with session history', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const intervention = interventionFactory.build({
        contractType: { code: 'ACC', name: 'accommodation' },
        serviceCategories: [serviceCategory],
      })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { interventionId: intervention.id, serviceCategoryIds: [serviceCategory.id] },
      }
      const deliusServiceUser = deliusServiceUserFactory.build()
      const probationPractitioner = ramDeliusUserFactory.build({
        name: {
          forename: 'John',
          surname: 'Smith',
        },
        username: 'john.smith',
      })
      const serviceProvider = hmppsAuthUserFactory.build({
        firstName: 'Case',
        lastName: 'Worker',
        username: 'case.worker',
      })
      const actionPlan = actionPlanFactory.submitted().build({
        referralId: referralParams.id,
        numberOfSessions: 4,
      })

      const appointments = [
        actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentTime: '2021-03-24T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
        actionPlanAppointmentFactory.attended('no').build({
          sessionNumber: 1,
          appointmentTime: '2021-04-23T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
        actionPlanAppointmentFactory.attended('no').build({
          sessionNumber: 1,
          appointmentTime: '2021-05-23T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),

        actionPlanAppointmentFactory.build({
          sessionNumber: 2,
          appointmentTime: '2021-08-31T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
        actionPlanAppointmentFactory.attended('no').build({
          sessionNumber: 2,
          appointmentTime: '2021-05-31T09:02:02Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 3,
          appointmentTime: new Date(Date.now() + 100000000).toISOString(),
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
        }),
      ]

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: serviceProvider.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetCaseDetailsByCrn(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
      cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)

      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
        { id: actionPlan.id, submittedAt: actionPlan.submittedAt, approvedAt: actionPlan.approvedAt },
      ])
      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)

      cy.login()
      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.get('[data-cy=session-table]')
        .getTable()
        .should(result => {
          expect(result).to.have.length(3)
          expect(result[0]).to.deep.include({
            'Session details': 'Session 1',
            'Time and date': '9:02am on 24 Mar 2021',
            Status: 'needs feedback',
          })
          expect(result[0]).to.contains(/^Reschedule session[\n|\n]*Give feedback$/)
          expect(result[0]).to.contains(/^Session 1 history/gi)
          expect(result[1]).to.deep.include({
            'Session details': 'Session 2',
            'Time and date': '10:02am on 31 Aug 2021',
            Status: 'needs feedback',
          })
          expect(result[1]).to.contains(/^Reschedule session[\n|\n]*Give feedback$/)
          expect(result[1]).to.contains(/^Session 2 history/gi)
          expect(result[2]).to.deep.include({
            'Session details': 'Session 3',
            Status: 'scheduled',
          })
          expect(result[2]).to.contains(/^Reschedule session[\n|\n]*Give feedback$/)
        })
    })
  })

  describe('Viewing session feedback', () => {
    const crn = 'X123456'
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const intervention = interventionFactory.build({
      contractType: { code: 'ACC', name: 'accommodation' },
      serviceCategories: [serviceCategory],
    })
    const serviceProvider = hmppsAuthUserFactory.build({
      firstName: 'Case',
      lastName: 'Worker',
      username: 'case.worker',
    })
    const referralParams = {
      id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
      referral: {
        interventionId: intervention.id,
        serviceCategoryId: serviceCategory.id,
        serviceUser: { crn },
      },
      assignedTo: serviceProvider,
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const probationPractitioner = ramDeliusUserFactory.build({
      name: {
        forename: 'John',
        surname: 'Smith',
      },
      username: 'john.smith',
    })
    const actionPlan = actionPlanFactory.approved().build({
      referralId: referralParams.id,
      numberOfSessions: 4,
    })
    const appointmentsWithSubmittedFeedback = [
      actionPlanAppointmentFactory.scheduled().build({
        sessionNumber: 1,
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'yes',
          },
          sessionFeedback: {
            sessionSummary: 'Discussed accommodation',
            sessionResponse: 'Engaged well',
            notifyProbationPractitioner: false,
          },
          submitted: true,
          submittedBy: serviceProvider,
        },
      }),
    ]
    beforeEach(() => {
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetActionPlanAppointments(actionPlan.id, appointmentsWithSubmittedFeedback)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentsWithSubmittedFeedback[0])
      cy.stubGetCaseDetailsByCrn(crn, deliusServiceUser)
      cy.stubGetSupplierAssessment(referralParams.id, supplierAssessmentFactory.build())
      cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)
    })

    it('allows users to know if, when and why an intervention was cancelled', () => {
      const endedReferral = sentReferralFactory
        .endRequested()
        .concluded()
        .build({
          ...referralParams,
        })
      const endedReferralSummaries = sentReferralForSummaries.concluded().build({
        assignedTo: serviceProvider,
      })
      cy.stubGetSentReferral(endedReferral.id, endedReferral)
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([endedReferralSummaries]).build())
      cy.stubGetApprovedActionPlanSummaries(endedReferral.id, [])
      cy.login()
      cy.visit(`/service-provider/referrals/${endedReferral.id}/progress`)
      cy.contains('Intervention ended')
      cy.contains(
        'The probation practitioner ended this intervention on 28 April 2021 because: Service user was recalled'
      )
      cy.contains('An end of service report needs to be submitted within 5 working days.').should('not.exist')
      cy.contains("Additional information: you'll be seeing alex again soon i'm sure!")
    })

    it('allows users to know that they should still concluded non concluded but ended referrals', () => {
      const endedReferral = sentReferralFactory.endRequested().build({
        ...referralParams,
      })

      const endedReferralSummaries = sentReferralForSummaries.build({
        assignedTo: serviceProvider,
      })
      cy.stubGetSentReferral(endedReferral.id, endedReferral)
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([endedReferralSummaries]).build())
      cy.stubGetApprovedActionPlanSummaries(endedReferral.id, [])
      cy.login()
      cy.visit(`/service-provider/referrals/${endedReferral.id}/progress`)
      cy.contains('An end of service report needs to be submitted within 5 working days.')
    })

    it('allows users to click through to a page to view session feedback', () => {
      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: serviceProvider.username },
        actionPlanId: actionPlan.id,
      })
      const assignedReferralSummaries = sentReferralForSummaries.build({
        assignedTo: { username: serviceProvider.username },
      })
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([assignedReferralSummaries]).build())
      cy.stubGetApprovedActionPlanSummaries(assignedReferral.id, [
        { id: actionPlan.id, submittedAt: actionPlan.submittedAt, approvedAt: actionPlan.approvedAt },
      ])
      cy.login()
      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.contains('Intervention cancelled').should('not.exist')
      cy.contains('View feedback form').click()
      cy.contains('Session details')
      cy.contains('Session attendance')
      cy.contains('Session feedback')
    })
  })

  describe('End of Service Reports', () => {
    const desiredOutcomes = [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service user makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service user is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ]

    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })
    const accommodationIntervention = interventionFactory.build({
      contractType: { code: 'SOC', name: 'Social inclusion' },
      serviceCategories: [serviceCategory],
    })

    const selectedDesiredOutcomes = [desiredOutcomes[0], desiredOutcomes[1]]
    const selectedDesiredOutcomesIds = selectedDesiredOutcomes.map(outcome => outcome.id)
    const referralParams = {
      referral: {
        interventionId: accommodationIntervention.id,
        serviceCategoryIds: [serviceCategory.id],
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: selectedDesiredOutcomesIds }],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const deliusUser = ramDeliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const referral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username } })

    const referralForDashboard = sentReferralForSummaries
      .assigned()
      .build({ assignedTo: { username: hmppsAuthUser.username } })

    const actionPlan = actionPlanFactory.submitted(referral.id).build()
    referral.actionPlanId = actionPlan.id

    beforeEach(() => {
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([referralForDashboard]).build())
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())
      cy.stubGetActionPlanAppointments(actionPlan.id, [])
      cy.stubGetApprovedActionPlanSummaries(referral.id, [])
    })

    it('User fills in, reviews, changes, and submits an end of service report', () => {
      const referralNeedingEndOfServiceReport = { ...referral, endOfServiceReportCreationRequired: true }
      const draftEndOfServiceReport = endOfServiceReportFactory
        .justCreated()
        .build({ referralId: referralNeedingEndOfServiceReport.id })

      cy.stubCreateDraftEndOfServiceReport(draftEndOfServiceReport)
      cy.stubGetEndOfServiceReport(draftEndOfServiceReport.id, draftEndOfServiceReport)
      cy.stubGetSentReferral(referralNeedingEndOfServiceReport.id, referralNeedingEndOfServiceReport)

      cy.login()

      cy.visit(`/service-provider/referrals/${referralNeedingEndOfServiceReport.id}/progress`)
      cy.contains('Create end of service report').click()

      cy.location('pathname').should(
        'equal',
        `/service-provider/end-of-service-report/${draftEndOfServiceReport.id}/outcomes/1`
      )

      cy.contains('Social inclusion: End of service report')
      cy.contains('About desired outcome 1')
      cy.contains(selectedDesiredOutcomes[0].description)

      cy.withinFieldsetThatContains('Overall, did Alex achieve desired outcome 1?', () => {
        cy.contains('Achieved').click()
      })
      cy.contains('Do you have any further comments about their progression on this outcome?').type(
        'They have done very well'
      )
      cy.contains('Is there anything else that needs doing to achieve this outcome?').type('They could still do x')

      const endOfServiceReportWithFirstOutcome = {
        ...draftEndOfServiceReport,
        outcomes: [
          {
            desiredOutcome: selectedDesiredOutcomes[0],
            achievementLevel: 'ACHIEVED',
            progressionComments: 'They have done very well',
            additionalTaskComments: 'They could still do x',
          },
        ],
      }
      cy.stubUpdateDraftEndOfServiceReport(endOfServiceReportWithFirstOutcome.id, endOfServiceReportWithFirstOutcome)
      cy.stubGetEndOfServiceReport(endOfServiceReportWithFirstOutcome.id, endOfServiceReportWithFirstOutcome)

      cy.contains('Save and continue').click()

      cy.contains('Social inclusion: End of service report')
      cy.contains('About desired outcome 2')
      cy.contains(selectedDesiredOutcomes[1].description)

      cy.withinFieldsetThatContains('Overall, did Alex achieve desired outcome 2?', () => {
        cy.contains('Partially achieved').click()
      })
      cy.contains('Do you have any further comments about their progression on this outcome?').type(
        'They have done fairly well'
      )
      cy.contains('Is there anything else that needs doing to achieve this outcome?').type(
        'They could still do x, y, and z'
      )

      const endOfServiceReportWithSecondOutcome = {
        ...draftEndOfServiceReport,
        outcomes: [
          ...endOfServiceReportWithFirstOutcome.outcomes,
          {
            desiredOutcome: selectedDesiredOutcomes[1],
            achievementLevel: 'PARTIALLY_ACHIEVED',
            progressionComments: 'They have done fairly well',
            additionalTaskComments: 'They could still do x, y, and z',
          },
        ],
      }
      cy.stubUpdateDraftEndOfServiceReport(endOfServiceReportWithSecondOutcome.id, endOfServiceReportWithSecondOutcome)
      cy.stubGetEndOfServiceReport(endOfServiceReportWithSecondOutcome.id, endOfServiceReportWithSecondOutcome)

      cy.contains('Save and continue').click()

      cy.contains('Social inclusion: End of service report')
      cy.contains('Would you like to give any additional information about this intervention (optional)?')
      cy.contains(
        'Provide any further information that you believe is important for the probation practitioner to know.'
      ).type('You should know x and y')

      const endOfServiceReportWithFurtherInformation = {
        ...endOfServiceReportWithSecondOutcome,
        furtherInformation: 'You should know x and y',
      }
      cy.stubUpdateDraftEndOfServiceReport(
        endOfServiceReportWithFurtherInformation.id,
        endOfServiceReportWithFurtherInformation
      )
      cy.stubGetEndOfServiceReport(
        endOfServiceReportWithFurtherInformation.id,
        endOfServiceReportWithFurtherInformation
      )

      cy.contains('Save and continue').click()

      cy.contains('Review the end of service report')

      cy.get('#change-outcome-2').click()
      cy.contains('Do you have any further comments about their progression on this outcome?').next().type(`
        'I think that overall it’s gone well but they could make some changes'
      `)

      cy.contains('Save and continue').click()

      cy.contains('Would you like to give any additional information about this intervention (optional)?')
      cy.contains(
        'Provide any further information that you believe is important for the probation practitioner to know.'
      )
        .next()
        .type('It’s important that you know p and q')
      cy.contains('Save and continue').click()

      cy.contains('Review the end of service report')

      const submittedEndOfServiceReport = {
        ...endOfServiceReportWithFurtherInformation,
        submittedAt: new Date().toISOString(),
      }

      cy.stubGetSentReferral(referral.id, {
        ...referralNeedingEndOfServiceReport,
        endOfServiceReport: submittedEndOfServiceReport,
      })
      cy.stubSubmitEndOfServiceReport(submittedEndOfServiceReport.id, submittedEndOfServiceReport)

      cy.contains('Submit the report').click()

      cy.contains('End of service report submitted')

      cy.contains('Return to service progress').click()
      cy.get('#end-of-service-report-status').contains('Submitted')
    })

    it('User views a submitted End of Service Report', () => {
      const submittedEndOfServiceReport = endOfServiceReportFactory.submitted().build({
        referralId: referral.id,
        outcomes: [
          {
            desiredOutcome: selectedDesiredOutcomes[0],
            achievementLevel: 'ACHIEVED',
            progressionComments: 'They have done very well',
            additionalTaskComments: 'They could still do x',
          },
          {
            desiredOutcome: selectedDesiredOutcomes[1],
            achievementLevel: 'PARTIALLY_ACHIEVED',
            progressionComments: 'They have done fairly well',
            additionalTaskComments: 'They could still do x, y, and z',
          },
        ],
        furtherInformation: 'You should know x and y',
      })

      referral.endOfServiceReport = submittedEndOfServiceReport
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetEndOfServiceReport(submittedEndOfServiceReport.id, submittedEndOfServiceReport)

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)
      cy.contains('View submitted report').click()

      cy.contains('They have done very well')
      cy.contains('They could still do x')

      cy.contains('They have done fairly well')
      cy.contains('They could still do x, y, and z')
    })
  })

  describe('Supplier assessments', () => {
    describe('appointments', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const serviceProvider = hmppsAuthUserFactory.build({
        firstName: 'Case',
        lastName: 'Worker',
        username: 'case.worker',
      })
      const probationPractitioner = ramDeliusUserFactory.build({
        name: {
          forename: 'John',
          surname: 'Smith',
        },
        username: 'john.smith',
      })
      const referral = sentReferralFactory.assigned().build({
        assignedTo: serviceProvider,
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      const supplierAssessment = supplierAssessmentFactory.justCreated.build()
      const deliusServiceUser = deliusServiceUserFactory.build()

      beforeEach(() => {
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetSupplierAssessment(referral.id, supplierAssessment)
        cy.stubGetSentReferral(referral.id, referral)
        cy.stubGetCaseDetailsByCrn(referral.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
        cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
        cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)
        cy.stubGetApprovedActionPlanSummaries(referral.id, [])
        cy.login()
      })
    })

    describe('Recording initial assessment feedback', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()
      const probationPractitioner = ramDeliusUserFactory.build({
        name: {
          forename: 'John',
          surname: 'Smith',
        },
        username: 'john.smith',
      })
      const serviceProvider = hmppsAuthUserFactory.build({
        firstName: 'Case',
        lastName: 'Worker',
        username: 'case.worker',
      })
      const sentReferral = sentReferralFactory.assigned().build({
        id: 'f437a412-078f-4bbf-82d8-569c2eb9ddb9',
        assignedTo: { username: serviceProvider.username },
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })

      const sentReferralSummaries = sentReferralForSummaries.assigned().build({
        id: 'f437a412-078f-4bbf-82d8-569c2eb9ddb9',
        assignedTo: { username: serviceProvider.username },
      })

      beforeEach(() => {
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([sentReferralSummaries]).build())
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
        cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetCaseDetailsByCrn(sentReferral.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)
        cy.stubGetApprovedActionPlanSummaries(sentReferral.id, [])
      })

      describe('when user records the attendance as not attended', () => {
        it('should allow user to add attendance, check their answers and submit the referral', () => {
          const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inThePast.build({
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          })
          let supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithNoFeedback],
            currentAppointmentId: appointmentWithNoFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.login()

          cy.visit(`/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Supplier assessment appointment')
            .next()
            .contains('Feedback needs to be added on the same day the assessment is delivered.')

          cy.get('[data-cy=supplier-assessment-table]').contains('needs feedback')
          cy.get('[data-cy=supplier-assessment-table]').contains('Mark attendance and add feedback').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/attendance`
          )

          cy.get('[id=didSessionHappenNoRadio]').click()
          cy.get('[id=attendedNoRadio]').click()

          const appointmentWithAttendanceFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'VIDEO_CALL',
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'no',
                didSessionHappen: false,
              },
            },
          })

          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithAttendanceFeedback],
            currentAppointmentId: appointmentWithAttendanceFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentAttendance(sentReferral.id, appointmentWithAttendanceFeedback)
          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/no-session`
          )

          cy.contains('Add anything you know about why they did not attend and how you tried to contact them').type(
            'They did not attend and I phoned them.'
          )
          cy.contains('Does the probation practitioner need to be notified about any issues?')
          cy.get('[id=noNotifyPPRadio]').click()

          const appointmentWithSessionFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentFeedback: {
              attendanceFeedback: {
                didSessionHappen: false,
                attended: 'no',
              },
              sessionFeedback: {
                noAttendanceInformation: 'They did not attend and I phoned them.',
                notifyProbationPractitioner: false,
              },
            },
          })

          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithSessionFeedback],
            currentAppointmentId: appointmentWithSessionFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentSessionFeedback(sentReferral.id, appointmentWithSessionFeedback)

          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )
          cy.contains('Check your answers')
          cy.contains('Session details')
          cy.contains('Session attendance')
          cy.contains('Session feedback')

          const submittedAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'yes',
                didSessionHappen: true,
              },
              sessionFeedback: {
                sessionSummary: 'Discussed accommodation',
                sessionResponse: 'Engaged well',
                notifyProbationPractitioner: true,
              },
              submitted: true,
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [submittedAppointment],
            currentAppointmentId: submittedAppointment.id,
          })

          const hmppsAuthUser = hmppsAuthUserFactory.build({
            firstName: 'John',
            lastName: 'Smith',
            username: 'john.smith',
          })
          cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)

          cy.stubSubmitSupplierAssessmentAppointmentFeedback(sentReferral.id, appointmentWithSessionFeedback)
          cy.get('form').contains('Confirm').click()

          cy.contains('Appointment feedback added')

          cy.location('pathname').should('equal', `/service-provider/referrals/${sentReferral.id}/progress`)
        })

        it('allows the user to reschedule a new appointment and view the old appointment in the table', () => {
          const hmppsAuthUser = hmppsAuthUserFactory.build({
            firstName: 'John',
            lastName: 'Smith',
            username: 'john.smith',
          })
          cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)

          const unattendedAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2022-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'no',
                didSessionHappen: false,
              },
              sessionFeedback: {
                noAttendanceInformation: 'They did not attend',
                notifyProbationPractitioner: false,
              },
              submitted: true,
              submittedBy: { username: hmppsAuthUser.username, userId: hmppsAuthUser.username, authSource: 'auth' },
            },
          })

          const supplierAssessment = supplierAssessmentFactory.build({
            appointments: [unattendedAppointment],
            currentAppointmentId: unattendedAppointment.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.login()

          cy.visit(`/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Supplier assessment appointment')
            .next()
            .contains('Feedback needs to be added on the same day the assessment is delivered.')

          cy.get('[data-cy=supplier-assessment-table]')
            .getTable()
            .should('deep.equal', [
              {
                'Time and date': '9:02am on 24 Mar 2022',
                Status: 'did not attend',
                Action: 'RescheduleView feedback',
              },
            ])

          cy.get('[data-cy=supplier-assessment-table]').contains('View feedback').click()

          cy.contains('Appointment feedback')
          cy.contains('They did not attend')

          cy.contains('Back').click()

          cy.get('[data-cy=supplier-assessment-table]').contains('Reschedule').click()

          cy.location('pathname').should(
            'match',
            new RegExp(`/service-provider/referrals/${sentReferral.id}/supplier-assessment/schedule/[a-z0-9-]+/details`)
          )

          cy.get('#date-day').clear()
          cy.get('#date-day').type('10')
          cy.get('#date-month').clear()
          cy.get('#date-month').type('3')
          cy.get('#date-year').clear()
          cy.get('#date-year').type('2022')
          cy.get('#time-hour').clear()
          cy.get('#time-hour').type('4')
          cy.get('#time-minute').clear()
          cy.get('#time-minute').type('15')
          cy.get('#time-part-of-day').select('PM')
          cy.get('#duration-hours').clear()
          cy.get('#duration-minutes').clear()
          cy.get('#duration-minutes').type('45')
          cy.contains('Video call').click()

          cy.contains('Save and continue').click()

          const rescheduledAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2022-03-10T016:15:00Z',
            durationInMinutes: 45,
          })

          const supplierAssessmentWithRescheduledAppointment = supplierAssessmentFactory.build({
            ...supplierAssessment,
            appointments: [unattendedAppointment, rescheduledAppointment],
            currentAppointmentId: rescheduledAppointment.id,
          })

          cy.stubScheduleSupplierAssessmentAppointment(
            supplierAssessmentWithRescheduledAppointment.id,
            rescheduledAppointment
          )

          cy.get('h1').contains('Confirm appointment details')
          cy.contains('4:15pm to 5:00pm')

          cy.get('button').contains('Confirm').click()
        })
      })

      describe('when user records the attendance as attended', () => {
        it('should allow user to add attendance, add session feedback, check their answers and submit the referral', () => {
          const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inThePast.build({
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          })
          let supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithNoFeedback],
            currentAppointmentId: appointmentWithNoFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.login()

          cy.visit(`/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Supplier assessment appointment')
            .next()
            .contains('Feedback needs to be added on the same day the assessment is delivered.')

          cy.get('[data-cy=supplier-assessment-table]').contains('needs feedback')
          cy.get('[data-cy=supplier-assessment-table]').contains('Mark attendance and add feedback').click()

          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/attendance`
          )
          cy.get('[id=didSessionHappenYesRadio]').click()

          const appointmentWithAttendanceFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'yes',
                didSessionHappen: true,
              },
            },
          })

          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithAttendanceFeedback],
            currentAppointmentId: appointmentWithAttendanceFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentAttendance(sentReferral.id, appointmentWithAttendanceFeedback)
          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/behaviour`
          )

          cy.contains('Was Alex River late?')
          cy.get('[id=wasLateNoRadio]').click()
          cy.contains('What did you do in the appointment?').type('Discussed his mental health')
          cy.contains('How did Alex River respond to the appointment?').type("Wasn't engaged")
          cy.contains('Does the probation practitioner need to be notified about any issues?')
          cy.get('[id=notify-probation-practitioner-of-concerns]').click()
          cy.contains('Add details about your concerns.').type('Alex was acting very suspicious.')

          const appointmentWithSessionFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentFeedback: {
              attendanceFeedback: {
                didSessionHappen: true,
                attended: 'yes',
              },
              sessionFeedback: {
                late: false,
                sessionSummary: 'Discussed his mental health',
                sessionResponse: "Wasn't engaged",
                sessionConcerns: 'Alex was acting very suspicious.',
                notifyProbationPractitioner: true,
              },
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithSessionFeedback],
            currentAppointmentId: appointmentWithSessionFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentSessionFeedback(sentReferral.id, appointmentWithSessionFeedback)

          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )
          cy.contains('Check your answers')
          cy.contains('Session details')
          cy.contains('Session attendance')
          cy.contains('Session feedback')

          const submittedAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'yes',
                didSessionHappen: true,
              },
              sessionFeedback: {
                sessionSummary: 'Discussed accommodation',
                sessionResponse: 'Engaged well',
                notifyProbationPractitioner: true,
              },
              submitted: true,
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [submittedAppointment],
            currentAppointmentId: submittedAppointment.id,
          })
          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)

          cy.stubSubmitSupplierAssessmentAppointmentFeedback(sentReferral.id, appointmentWithSessionFeedback)
          cy.get('form').contains('Confirm').click()

          cy.contains('Appointment feedback added')

          cy.location('pathname').should('equal', `/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Supplier assessment appointment')
            .next()
            .contains('The initial assessment has been delivered and feedback added.')

          cy.get('[data-cy=supplier-assessment-table]').contains('completed')
          cy.get('[data-cy=supplier-assessment-table]').contains('View feedback').click()

          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback`
          )
        })
      })
    })
  })

  describe('User requests reporting data', () => {
    it('allows the user to request a report based on the requested date range', () => {
      const intervention = interventionFactory.build()

      const sentReferrals = [
        sentReferralFactory.build({
          referral: {
            interventionId: intervention.id,
          },
        }),
        sentReferralFactory.build({
          referral: {
            interventionId: intervention.id,
          },
        }),
      ]

      const deliusUser = ramDeliusUserFactory.build()

      cy.stubGetIntervention(intervention.id, intervention)
      sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGenerateServiceProviderPerformanceReport()
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())

      cy.login()

      cy.contains('Reporting').click()
      cy.contains('Reporting')

      cy.get('#from-date-day').clear()
      cy.get('#from-date-day').type('10')
      cy.get('#from-date-month').clear()
      cy.get('#from-date-month').type('6')
      cy.get('#from-date-year').clear()
      cy.get('#from-date-year').type('2021')
      cy.get('#to-date-day').clear()
      cy.get('#to-date-day').type('27')
      cy.get('#to-date-month').clear()
      cy.get('#to-date-month').type('6')
      cy.get('#to-date-year').clear()
      cy.get('#to-date-year').type('2021')

      cy.contains('Request data').click()

      cy.get('h1').contains('Your request has been submitted')

      cy.contains('Return to dashboard').click()
      cy.location('pathname').should('equal', `/service-provider/dashboard`)
    })
  })

  describe('Returns to correct dashboard after user clicks back', () => {
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

    const conviction = caseConvictionFactory.build()

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
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        referral: {
          interventionId: personalWellbeingIntervention.id,
          relevantSentenceId: conviction.conviction.id,
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

    const sentReferralsSummaries = [
      sentReferralForSummaries.build({
        id: sentReferrals[0].id,
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        assignedTo: null,
        serviceUser: { firstName: 'George', lastName: 'Michael' },
        interventionTitle: 'Social Inclusion - West Midlands',
      }),
      sentReferralForSummaries.build({
        id: sentReferrals[1].id,
        sentAt: '2020-12-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        assignedTo: null,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
        interventionTitle: 'Personal Wellbeing - West Midlands',
      }),
    ]

    const deliusUser = ramDeliusUserFactory.build()

    const deliusServiceUser = deliusServiceUserFactory.build({
      name: {
        forename: 'Jenny',
        surname: 'Jones',
      },
      contactDetails: {
        emailAddress: 'jenny.jones@example.com',
        mobileNumber: '07123456789',
        telephoneNumber: '0798765432',
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

    const dashBoardTables = [
      {
        dashboardType: 'My cases',
        pathname: 'my-cases',
      },
      {
        dashboardType: 'All open cases',
        pathname: 'all-open-cases',
      },
      {
        dashboardType: 'Unassigned cases',
        pathname: 'unassigned-cases',
      },
      {
        dashboardType: 'Completed cases',
        pathname: 'completed-cases',
      },
    ]

    dashBoardTables.forEach(table => {
      const hmppsAuthUser = hmppsAuthUserFactory.build({
        firstName: 'John',
        lastName: 'Smith',
        username: 'john.smith',
        email: 'john.smith@example.com',
      })
      it(`returns to dashboard "${table.dashboardType}" when clicking back`, () => {
        cy.stubGetIntervention(personalWellbeingIntervention.id, personalWellbeingIntervention)
        cy.stubGetIntervention(socialInclusionIntervention.id, socialInclusionIntervention)
        sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
        cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent(sentReferralsSummaries).build())
        cy.stubGetUserByUsername(deliusUser.username, deliusUser)
        cy.stubGetCaseDetailsByCrn(referralToSelect.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetAuthUserByEmailAddress([hmppsAuthUser])
        cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
        cy.stubAssignSentReferral(referralToSelect.id, referralToSelect)
        cy.stubGetConvictionByCrnAndId(referralToSelect.referral.serviceUser.crn, conviction.conviction.id, conviction)
        cy.stubGetSupplementaryRiskInformation(referralToSelect.supplementaryRiskId, supplementaryRiskInformation)
        cy.stubGetResponsibleOfficer(referralToSelect.referral.serviceUser.crn, [responsibleOfficer])
        cy.stubGetSupplierAssessment(referralToSelect.id, supplierAssessmentFactory.build())
        cy.stubGetApprovedActionPlanSummaries(referralToSelect.id, [])
        cy.login()

        cy.get('a').contains(table.dashboardType).click()

        cy.contains('Next').click()

        cy.contains('Jenny Jones').click()
        cy.location('pathname').should('equal', `/service-provider/referrals/${referralToSelect.id}/details`)

        cy.contains('Back').click()
        cy.location('pathname').should('equal', `/service-provider/dashboard/${table.pathname}`)
        cy.location('search').should('equal', `?page=2`)
      })
    })
  })
})
