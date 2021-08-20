import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import hmppsAuthUserFactory from '../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../testutils/factories/endOfServiceReport'
import interventionFactory from '../../testutils/factories/intervention'
import deliusConvictionFactory from '../../testutils/factories/deliusConviction'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import deliusStaffDetailsFactory from '../../testutils/factories/deliusStaffDetails'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../testutils/factories/initialAssessmentAppointment'
import deliusOffenderManagerFactory from '../../testutils/factories/deliusOffenderManager'
import serviceProviderSentReferralSummaryFactory from '../../testutils/factories/serviceProviderSentReferralSummary'
import actionPlanActivityFactory from '../../testutils/factories/actionPlanActivity'

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

    const staffDetails = deliusStaffDetailsFactory.build({
      teams: [
        {
          telephone: '07890 123456',
          emailAddress: 'probation-team4692@justice.gov.uk',
          startDate: '2021-01-01',
        },
      ],
    })

    const responsibleOfficer = deliusOffenderManagerFactory.build({
      staff: {
        forenames: 'Peter',
        surname: 'Practitioner',
        email: 'p.practitioner@justice.gov.uk',
        phoneNumber: '01234567890',
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
    cy.stubGetStaffDetails(referralToSelect.sentBy.username, staffDetails)
    cy.stubGetResponsibleOfficersForServiceUser(referralToSelect.referral.serviceUser.crn, [responsibleOfficer])

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
    cy.contains('Responsible officer details').next().contains('Email').next().contains('p.practitioner@justice.gov.uk')

    cy.contains('Bernard Beaks')
    cy.contains('bernard.beaks@justice.gov.uk')

    cy.contains('Team contact details').next().contains('Phone').next().contains('07890 123456')

    cy.contains('Team contact details')
      .next()
      .contains('Email address')
      .next()
      .contains('probation-team4692@justice.gov.uk')
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
      const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
      const staffDetails = deliusStaffDetailsFactory.build()
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
      cy.stubGetStaffDetails(referral.sentBy.username, staffDetails)
      cy.stubGetResponsibleOfficersForServiceUser(referral.referral.serviceUser.crn, [responsibleOfficer])

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
      const staffDetails = deliusStaffDetailsFactory.build()
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
      cy.stubGetStaffDetails(referral.sentBy.username, staffDetails)
      cy.stubGetResponsibleOfficersForServiceUser(referral.referral.serviceUser.crn, [responsibleOfficer])

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
    const deliusUser = deliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const assignedReferral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username } })
    const draftActionPlan = actionPlanFactory.justCreated(assignedReferral.id).build()
    const actionPlanAppointments = [
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 1 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 2 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 3 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 4 }),
    ]
    const referralSummary = serviceProviderSentReferralSummaryFactory
      .fromReferralAndIntervention(assignedReferral, accommodationIntervention)
      .withAssignedUser(hmppsAuthUser.username)
      .build()

    cy.stubGetSentReferralsForUserToken([assignedReferral])

    cy.stubGetServiceProviderSentReferralsSummaryForUserToken([referralSummary])
    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlan)
    cy.stubCreateDraftActionPlan(draftActionPlan)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
    cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
    cy.stubGetActionPlanAppointments(draftActionPlan.id, actionPlanAppointments)
    cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())

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
    const submittedActionPlan = { ...draftActionPlanWithNumberOfSessions, submittedAt: new Date().toISOString() }

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
    cy.get('.action-plan-submitted-date').contains(/\d{1,2} [A-Z][a-z]{2} \d{4}/)
  })

  it('User edits an unapproved action plan and submits it for approval', () => {
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
      },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const deliusUser = deliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const assignedReferral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username }, actionPlanId })

    const activityId = '1'
    const submittedActionPlan = actionPlanFactory.submitted(assignedReferral.id).build({
      id: actionPlanId,
      activities: [actionPlanActivityFactory.build({ id: activityId, description: 'First activity version 1' })],
      submittedAt: '2021-08-19T11:03:47.061Z',
    })
    const referralSummary = serviceProviderSentReferralSummaryFactory
      .fromReferralAndIntervention(assignedReferral, accommodationIntervention)
      .withAssignedUser(hmppsAuthUser.username)
      .build()

    cy.stubGetSentReferralsForUserToken([assignedReferral])

    cy.stubGetServiceProviderSentReferralsSummaryForUserToken([referralSummary])
    cy.stubGetActionPlan(submittedActionPlan.id, submittedActionPlan)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
    cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
    cy.stubGetActionPlanAppointments(submittedActionPlan.id, [])
    cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())

    cy.login()

    cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
    cy.get('#action-plan-status').contains('Awaiting approval')
    cy.contains('19 Aug 2021')
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

    cy.contains('First activity version 1').clear().type('First activity version 2')
    cy.stubUpdateActionPlanActivity(submittedActionPlan.id, activity.id, actionPlanWithUpdatedActivities)
    cy.contains('Save and add activity 1').click()

    cy.contains('Continue without adding other activities').click()

    cy.get('#number-of-sessions').clear().type('5')

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
    cy.contains('20 Aug 2021')
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
      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, appointment)
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())
      cy.login()
    })

    describe('with valid inputs', () => {
      describe('when booking for an In-Person Meeting - Other Location', () => {
        it('should present no errors and display scheduled appointment', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
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
            appointmentTime: '2021-03-24T09:02:02Z',
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

          cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)

          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)

          cy.get('#date-day').should('have.value', '24')
          cy.get('#date-month').should('have.value', '3')
          cy.get('#date-year').should('have.value', '2021')
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
      })

      describe('when booking for an In-Person Meeting - NPS Location', () => {
        it('should present no errors and display scheduled appointment', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
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
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            sessionType: 'GROUP',
            appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
            appointmentDeliveryAddress: null,
            npsOfficeCode: 'CRS0105',
          })
          cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
          cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

          cy.contains('Save and continue').click()

          cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
          // TODO: Add checks for NPS Office address on this page

          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)

          cy.get('#date-day').should('have.value', '24')
          cy.get('#date-month').should('have.value', '3')
          cy.get('#date-year').should('have.value', '2021')
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

    describe('with invalid inputs', () => {
      describe("when the user doesn't select a session type", () => {
        it('should show an error', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
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
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
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
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
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
    it('user records the Service user as having attended, and fills out behaviour screen', () => {
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
      const probationPractitioner = deliusUserFactory.build({
        firstName: 'John',
        surname: 'Smith',
        username: 'john.smith',
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
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetSentReferralsForUserToken([assignedReferral])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())

      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      const appointmentWithAttendanceRecorded = {
        ...appointments[0],
        sessionFeedback: {
          attendance: {
            attended: 'yes',
            additionalAttendanceInformation: 'Alex attended the session',
          },
        },
      }

      const appointmentWithBehaviourRecorded = {
        ...appointmentWithAttendanceRecorded,
        sessionFeedback: {
          attendance: {
            attended: 'yes',
            additionalAttendanceInformation: 'Alex attended the session',
          },
          behaviour: {
            behaviourDescription: 'Alex was well-behaved',
            notifyProbationPractitioner: false,
          },
        },
      }
      const appointmentWithSubmittedFeedback = {
        ...appointmentWithBehaviourRecorded,
        sessionFeedback: {
          attendance: {
            attended: 'yes',
            additionalAttendanceInformation: 'Alex attended the session',
          },
          behaviour: {
            behaviourDescription: 'Alex was well-behaved',
            notifyProbationPractitioner: false,
          },
          submitted: true,
        },
      }

      cy.login()

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

      cy.contains('Give feedback').click()

      cy.contains('Yes').click()
      cy.contains("Add additional information about Alex's attendance").type('Alex attended the session')

      cy.stubRecordActionPlanAppointmentAttendance(actionPlan.id, 1, appointmentWithAttendanceRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Add behaviour feedback')

      cy.contains("Describe Alex's behaviour in this session").type('Alex was well behaved')
      cy.contains('No').click()

      cy.stubRecordActionPlanAppointmentBehavior(actionPlan.id, 1, appointmentWithBehaviourRecorded)

      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithBehaviourRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Confirm feedback')
      cy.contains('Alex attended the session')
      cy.contains('Yes, they were on time')
      cy.contains('Alex was well-behaved')
      cy.contains('No')

      cy.stubSubmitActionPlanSessionFeedback(actionPlan.id, 1, appointmentWithSubmittedFeedback)

      cy.get('form').contains('Confirm').click()

      cy.contains('Session feedback added and submitted to the probation practitioner')
      cy.contains('You can now deliver the next session scheduled for 31 Mar 2021.')

      const updatedAppointments = [appointmentWithSubmittedFeedback, appointments[1]]
      cy.stubGetActionPlanAppointments(actionPlan.id, updatedAppointments)

      cy.contains('Return to service progress').click()

      cy.get('table')
        .getTable()
        .should('deep.equal', [
          {
            'Session details': 'Session 1',
            'Date and time': '24 Mar 2021, 09:02',
            Status: 'completed',
            Action: 'View feedback form',
          },
          {
            'Session details': 'Session 2',
            'Date and time': '31 Mar 2021, 10:02',
            Status: 'scheduled',
            Action: 'Reschedule sessionGive feedback',
          },
        ])
    })

    it('user records the Service user as having not attended, and skips behaviour screen', () => {
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
      const probationPractitioner = deliusUserFactory.build({
        firstName: 'John',
        surname: 'Smith',
        username: 'john.smith',
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
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetSentReferralsForUserToken([assignedReferral])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())

      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      const appointmentWithAttendanceRecorded = {
        ...appointments[0],
        sessionFeedback: {
          attendance: {
            attended: 'no',
            additionalAttendanceInformation: "Alex didn't attend",
          },
          behaviour: {
            behaviourDescription: null,
            notifyProbationPractitioner: null,
          },
        },
      }

      const appointmentWithSubmittedFeedback = {
        ...appointmentWithAttendanceRecorded,
        sessionFeedback: {
          attendance: {
            attended: 'no',
            additionalAttendanceInformation: "Alex didn't attend",
          },
          behaviour: {
            behaviourDescription: null,
            notifyProbationPractitioner: null,
          },
          submitted: true,
        },
      }

      cy.login()

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

      cy.contains('Give feedback').click()

      cy.contains('No').click()
      cy.contains("Add additional information about Alex's attendance").type("Alex didn't attend")

      cy.stubRecordActionPlanAppointmentAttendance(actionPlan.id, 1, appointmentWithAttendanceRecorded)

      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithAttendanceRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Confirm feedback')
      cy.contains('No')
      cy.contains("Alex didn't attend")

      cy.stubSubmitActionPlanSessionFeedback(actionPlan.id, 1, appointmentWithSubmittedFeedback)

      cy.get('form').contains('Confirm').click()

      cy.contains('Session feedback added and submitted to the probation practitioner')
      cy.contains('You can now deliver the next session scheduled for 31 Mar 2021.')

      const updatedAppointments = [appointmentWithSubmittedFeedback, appointments[1]]
      cy.stubGetActionPlanAppointments(actionPlan.id, updatedAppointments)

      cy.contains('Return to service progress').click()

      cy.get('table')
        .getTable()
        .should('deep.equal', [
          {
            'Session details': 'Session 1',
            'Date and time': '24 Mar 2021, 09:02',
            Status: 'did not attend',
            Action: 'View feedback form',
          },
          {
            'Session details': 'Session 2',
            'Date and time': '31 Mar 2021, 10:02',
            Status: 'scheduled',
            Action: 'Reschedule sessionGive feedback',
          },
        ])
    })
  })

  describe('Viewing session feedback', () => {
    const crn = 'X123456'
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const intervention = interventionFactory.build({
      contractType: { code: 'ACC', name: 'accommodation' },
      serviceCategories: [serviceCategory],
    })
    const referralParams = {
      id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
      referral: {
        interventionId: intervention.id,
        serviceCategoryId: serviceCategory.id,
        serviceUser: { crn },
      },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const probationPractitioner = deliusUserFactory.build({
      firstName: 'John',
      surname: 'Smith',
      username: 'john.smith',
    })
    const actionPlan = actionPlanFactory.submitted().build({
      referralId: referralParams.id,
      numberOfSessions: 4,
    })
    const appointmentsWithSubmittedFeedback = [
      actionPlanAppointmentFactory.scheduled().build({
        sessionNumber: 1,
        sessionFeedback: {
          attendance: {
            attended: 'yes',
            additionalAttendanceInformation: 'Alex attended the session',
          },
          behaviour: {
            behaviourDescription: 'Alex was well-behaved',
            notifyProbationPractitioner: false,
          },
          submitted: true,
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
      cy.stubGetServiceUserByCRN(crn, deliusServiceUser)
      cy.stubGetSupplierAssessment(referralParams.id, supplierAssessmentFactory.build())
    })
    it('allows users to know if, when and why an intervention was cancelled', () => {
      const endedReferral = sentReferralFactory
        .endRequested()
        .concluded()
        .build({
          ...referralParams,
        })
      cy.stubGetSentReferral(endedReferral.id, endedReferral)
      cy.stubGetSentReferralsForUserToken([endedReferral])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.login()
      cy.visit(`/service-provider/referrals/${endedReferral.id}/progress`)
      cy.contains('Intervention ended')
      cy.contains(
        'The probation practitioner ended this intervention on 28 Apr 2021 with reason: Service user was recalled'
      )
      cy.contains('Please note that an end of service report must still be submitted within 10 working days.').should(
        'not.exist'
      )
      cy.contains("Additional information: you'll be seeing alex again soon i'm sure!")
    })
    it('allows users to know that they should still concluded non concluded but ended referrals', () => {
      const endedReferral = sentReferralFactory.endRequested().build({
        ...referralParams,
      })
      cy.stubGetSentReferral(endedReferral.id, endedReferral)
      cy.stubGetSentReferralsForUserToken([endedReferral])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.login()
      cy.visit(`/service-provider/referrals/${endedReferral.id}/progress`)
      cy.contains('Please note that an end of service report must still be submitted within 10 working days.')
    })
    it('allows users to click through to a page to view session feedback', () => {
      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetSentReferralsForUserToken([assignedReferral])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.login()
      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.contains('Intervention cancelled').should('not.exist')
      cy.contains('View feedback form').click()
      cy.contains('Alex attended the session')
      cy.contains('Yes, they were on time')
      cy.contains('Alex was well-behaved')
      cy.contains('No')
    })
  })

  it('User fills in, reviews, changes, and submits an end of service report', () => {
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
    const deliusUser = deliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const referral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username } })
    const actionPlan = actionPlanFactory.submitted(referral.id).build()
    referral.actionPlanId = actionPlan.id
    const draftEndOfServiceReport = endOfServiceReportFactory.justCreated().build({ referralId: referral.id })

    cy.stubGetSentReferralsForUserToken([referral])
    cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])

    cy.stubGetActionPlan(actionPlan.id, actionPlan)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
    cy.stubCreateDraftEndOfServiceReport(draftEndOfServiceReport)
    cy.stubGetEndOfServiceReport(draftEndOfServiceReport.id, draftEndOfServiceReport)
    cy.stubGetActionPlanAppointments(actionPlan.id, [])
    cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())

    cy.login()

    cy.visit(`/service-provider/referrals/${referral.id}/progress`)
    cy.contains('Create end of service report').click()

    cy.location('pathname').should(
      'equal',
      `/service-provider/end-of-service-report/${draftEndOfServiceReport.id}/outcomes/1`
    )

    cy.contains('Accommodation: End of service report')
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

    cy.contains('Accommodation: End of service report')
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

    cy.contains('Accommodation: End of service report')
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
    cy.stubGetEndOfServiceReport(endOfServiceReportWithFurtherInformation.id, endOfServiceReportWithFurtherInformation)

    cy.contains('Save and continue').click()

    cy.contains('Review the end of service report')

    cy.get('#change-outcome-2').click()
    cy.contains('Do you have any further comments about their progression on this outcome?')
      .type('{selectall}{backspace}')
      .type('I think that overall it’s gone well but they could make some changes')

    cy.contains('Save and continue').click()

    cy.contains('Would you like to give any additional information about this intervention (optional)?')
    cy.contains('Provide any further information that you believe is important for the probation practitioner to know.')
      .type('{selectall}{backspace}')
      .type('It’s important that you know p and q')

    cy.contains('Save and continue').click()

    cy.contains('Review the end of service report')

    const submittedEndOfServiceReport = {
      ...endOfServiceReportWithFurtherInformation,
      submittedAt: new Date().toISOString(),
    }

    cy.stubGetSentReferral(referral.id, { ...referral, endOfServiceReport: submittedEndOfServiceReport })
    cy.stubSubmitEndOfServiceReport(submittedEndOfServiceReport.id, submittedEndOfServiceReport)

    cy.contains('Submit the report').click()

    cy.contains('End of service report submitted')

    cy.contains('Return to service progress').click()
    cy.get('#end-of-service-report-status').contains('Submitted')
  })

  describe('Supplier assessments', () => {
    it('User schedules and views a supplier assessment appointment', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const referral = sentReferralFactory.assigned().build({
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      const supplierAssessment = supplierAssessmentFactory.justCreated.build()
      const deliusServiceUser = deliusServiceUserFactory.build()

      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessment)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)
      cy.get('#supplier-assessment-status').contains('not scheduled')
      cy.contains('Schedule initial assessment').click()

      cy.contains('Add appointment details')

      cy.get('#date-day').type('24')
      cy.get('#date-month').type('3')
      cy.get('#date-year').type('2021')
      cy.get('#time-hour').type('9')
      cy.get('#time-minute').type('02')
      cy.get('#time-part-of-day').select('AM')
      cy.get('#duration-hours').type('1')
      cy.get('#duration-minutes').type('15')
      cy.contains('In-person meeting - Other locations').click()
      cy.get('#method-other-location-address-line-1').type('Harmony Living Office, Room 4')
      cy.get('#method-other-location-address-line-2').type('44 Bouverie Road')
      cy.get('#method-other-location-address-town-or-city').type('Blackpool')
      cy.get('#method-other-location-address-county').type('Lancashire')
      cy.get('#method-other-location-address-postcode').type('SY4 0RE')

      const scheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '3021-03-24T09:02:02Z',
        durationInMinutes: 75,
        appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
        appointmentDeliveryAddress: {
          firstAddressLine: 'Harmony Living Office, Room 4',
          secondAddressLine: '44 Bouverie Road',
          townOrCity: 'Blackpool',
          county: 'Lancashire',
          postCode: 'SY4 0RE',
        },
      })
      const supplierAssessmentWithScheduledAppointment = supplierAssessmentFactory.build({
        ...supplierAssessment,
        appointments: [scheduledAppointment],
        currentAppointmentId: scheduledAppointment.id,
      })
      cy.stubScheduleSupplierAssessmentAppointment(supplierAssessment.id, scheduledAppointment)

      cy.contains('Save and continue').click()
      // We need to switch out the response _after_ the update, since the
      // redirect to the correct confirmation page depends on the pre-update
      // state. The best way to handle this would be using Wiremock scenarios
      // to trigger a state transition upon the PUT, but it would take a decent
      // chunk of work on our mocks that I don’t want to do now.
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentWithScheduledAppointment)

      cy.get('h1').contains('Initial assessment appointment added')
      cy.contains('Return to progress').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
      cy.get('#supplier-assessment-status').contains(/^\s*scheduled\s*$/)

      cy.contains('View appointment details').click()
      cy.get('h1').contains('View appointment details')

      cy.contains('24 March 3021')
      cy.contains('9:02am to 10:17am')
      cy.contains('In-person meeting')
      cy.contains('Harmony Living Office, Room 4')
      cy.contains('44 Bouverie Road')
      cy.contains('Blackpool')
      cy.contains('Lancashire')
      cy.contains('SY4 0RE')
    })

    it('User reschedules a supplier assessment appointment', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const referral = sentReferralFactory.assigned().build({
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      const scheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '3021-03-24T09:02:00Z',
        durationInMinutes: 75,
      })
      const supplierAssessmentWithScheduledAppointment = supplierAssessmentFactory.justCreated.build({
        appointments: [scheduledAppointment],
        currentAppointmentId: scheduledAppointment.id,
      })
      const deliusServiceUser = deliusServiceUserFactory.build()

      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentWithScheduledAppointment)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)

      cy.contains('View appointment details').click()

      cy.contains('Change appointment details').click()

      cy.get('h1').contains('Change appointment details')

      cy.get('#date-day').should('have.value', '24')
      cy.get('#date-month').should('have.value', '3')
      cy.get('#date-year').should('have.value', '3021')
      cy.get('#time-hour').should('have.value', '9')
      cy.get('#time-minute').should('have.value', '02')
      // https://stackoverflow.com/questions/51222840/cypress-io-how-do-i-get-text-of-selected-option-in-select
      cy.get('#time-part-of-day').find('option:selected').should('have.text', 'AM')
      cy.get('#duration-hours').should('have.value', '1')
      cy.get('#duration-minutes').should('have.value', '15')

      cy.get('#date-day').clear().type('10')
      cy.get('#date-month').clear().type('4')
      cy.get('#date-year').clear().type('2021')
      cy.get('#time-hour').clear().type('4')
      cy.get('#time-minute').clear().type('15')
      cy.get('#time-part-of-day').select('PM')
      cy.get('#duration-hours').clear()
      cy.get('#duration-minutes').clear().type('45')

      const rescheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '3021-04-10T16:15:00Z',
        durationInMinutes: 45,
      })
      const supplierAssessmentWithRescheduledAppointment = supplierAssessmentFactory.build({
        ...supplierAssessmentWithScheduledAppointment,
        appointments: [scheduledAppointment, rescheduledAppointment],
        currentAppointmentId: rescheduledAppointment.id,
      })
      cy.stubScheduleSupplierAssessmentAppointment(
        supplierAssessmentWithRescheduledAppointment.id,
        scheduledAppointment
      )

      cy.contains('Save and continue').click()
      // See comment in previous test about why we do this after the update
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentWithScheduledAppointment)

      cy.get('h1').contains('Initial assessment appointment updated')
      cy.contains('Return to progress').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
      cy.get('#supplier-assessment-status').contains(/^\s*scheduled\s*$/)
    })

    describe('Recording initial assessment feedback', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()
      const probationPractitioner = deliusUserFactory.build({
        firstName: 'John',
        surname: 'Smith',
        username: 'john.smith',
      })
      const sentReferral = sentReferralFactory.assigned().build({
        id: 'f437a412-078f-4bbf-82d8-569c2eb9ddb9',
        assignedTo: { username: probationPractitioner.username },
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      beforeEach(() => {
        cy.stubGetSentReferralsForUserToken([sentReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
        cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser)
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

          cy.contains('Initial assessment appointment')
            .next()
            .contains('Feedback needs to be added on the same day the assessment is delivered.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('awaiting feedback')
              cy.contains('To do').next().contains('Add feedback').click()
              cy.location('pathname').should(
                'equal',
                `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/attendance`
              )
            })
          cy.contains('No').click()
          cy.contains("Add additional information about Alex's attendance").type('Alex did not attend the session')

          const appointmentWithAttendanceFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'no',
                additionalAttendanceInformation: 'Alex did not attend the session',
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
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )

          cy.contains('24 March 2021')
          cy.contains('9:02am to 10:17am')
          cy.contains('Did Alex attend the initial assessment appointment?')
          cy.contains('No')
          cy.contains("Add additional information about Alex's attendance:")
          cy.contains('Alex did not attend the session')

          cy.stubSubmitSupplierAssessmentAppointmentFeedback(sentReferral.id, appointmentWithAttendanceFeedback)
          cy.get('form').contains('Confirm').click()

          cy.contains('Initial assessment added')

          const submittedAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'no',
                additionalAttendanceInformation: 'Alex did not attend this session',
              },
              submitted: true,
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [submittedAppointment],
            currentAppointmentId: submittedAppointment.id,
          })
          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.contains('Return to progress').click()
          cy.location('pathname').should('equal', `/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Initial assessment appointment')
            .next()
            .contains('The initial assessment has been delivered and feedback added.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('did not attend')
              cy.contains('To do').next().contains('Reschedule').click()
              cy.location('pathname').should(
                'equal',
                `/service-provider/referrals/${sentReferral.id}/supplier-assessment/schedule`
              )
            })
        })
      })

      describe('when user records the attendance as attended', () => {
        it('should allow user to add attendance, add behaviour, check their answers and submit the referral', () => {
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

          cy.contains('Initial assessment appointment')
            .next()
            .contains('Feedback needs to be added on the same day the assessment is delivered.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('awaiting feedback')
              cy.contains('To do').next().contains('Add feedback').click()
              cy.location('pathname').should(
                'equal',
                `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/attendance`
              )
            })
          cy.contains('Yes').click()
          cy.contains("Add additional information about Alex's attendance").type('Alex attended the session')

          const appointmentWithAttendanceFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'Alex attended the session',
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

          cy.contains("Describe Alex's behaviour in the assessment appointment").type(
            'Alex was acting very suspicious.'
          )
          cy.contains('Yes').click()

          const appointmentWithBehaviourFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'Alex attended the session',
              },
              behaviour: {
                behaviourDescription: 'Alex was acting very suspicious.',
                notifyProbationPractitioner: true,
              },
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithBehaviourFeedback],
            currentAppointmentId: appointmentWithBehaviourFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentBehaviour(sentReferral.id, appointmentWithBehaviourFeedback)

          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )
          cy.contains('24 March 2021')
          cy.contains('9:02am to 10:17am')
          cy.contains('Did Alex attend the initial assessment appointment?')
          cy.contains('Yes, they were on time')
          cy.contains("Add additional information about Alex's attendance:")
          cy.contains('Alex attended the session')
          cy.contains("Describe Alex's behaviour in the assessment appointment")
          cy.contains('Alex was acting very suspicious.')
          cy.contains('If you described poor behaviour, do you want to notify the probation practitioner?')
          cy.contains('Yes')

          cy.stubSubmitSupplierAssessmentAppointmentFeedback(sentReferral.id, appointmentWithBehaviourFeedback)
          cy.get('form').contains('Confirm').click()

          cy.contains('Initial assessment added')

          const submittedAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'Alex attended the session',
              },
              behaviour: {
                behaviourDescription: 'Alex was acting very suspicious.',
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
          cy.contains('Return to progress').click()
          cy.location('pathname').should('equal', `/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Initial assessment appointment')
            .next()
            .contains('The initial assessment has been delivered and feedback added.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('completed')
              cy.contains('To do').next().contains('View feedback').click()
              cy.location('pathname').should(
                'equal',
                `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback`
              )
            })
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

      const sentReferralsSummary = [
        serviceProviderSentReferralSummaryFactory.fromReferralAndIntervention(sentReferrals[0], intervention).build({}),
        serviceProviderSentReferralSummaryFactory.fromReferralAndIntervention(sentReferrals[1], intervention).build({}),
      ]

      const deliusUser = deliusUserFactory.build()

      cy.stubGetIntervention(intervention.id, intervention)
      sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
      cy.stubGetSentReferralsForUserToken(sentReferrals)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGenerateServiceProviderPerformanceReport()
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken(sentReferralsSummary)

      cy.login()

      cy.contains('Reporting').click()
      cy.contains('Reporting')

      cy.get('#from-date-day').clear().type('10')
      cy.get('#from-date-month').clear().type('6')
      cy.get('#from-date-year').clear().type('2021')
      cy.get('#to-date-day').clear().type('27')
      cy.get('#to-date-month').clear().type('6')
      cy.get('#to-date-year').clear().type('2021')

      cy.contains('Request data').click()

      cy.get('h1').contains('Your request has been submitted')

      cy.contains('Return to dashboard').click()
      cy.location('pathname').should('equal', `/service-provider/dashboard`)
    })
  })
})
