import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import interventionFactory from '../../../testutils/factories/intervention'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanActivityFactory from '../../../testutils/factories/actionPlanActivity'
import serviceProviderSentReferralSummaryFactory from '../../../testutils/factories/serviceProviderSentReferralSummary'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'

describe('As a Service Provider', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
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
      cy.contains('20 August 2021')
    })

    it('User edits an approved action plan and submits it for approval', () => {
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
      const approvedActionPlan = actionPlanFactory.approved(assignedReferral.id).build({
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
      cy.stubGetActionPlan(approvedActionPlan.id, approvedActionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
      cy.stubGetActionPlanAppointments(approvedActionPlan.id, [])
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())

      cy.login()

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
      cy.get('#action-plan-status').contains('Approved')
      cy.contains('19 August 2021')
      cy.contains('View action plan').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${assignedReferral.id}/action-plan`)

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

      cy.contains('Confirm and continue').click()

      const activity = actionPlanActivityFactory.build({ id: activityId, description: 'First activity version 2' })

      const actionPlanWithUpdatedActivities = actionPlanFactory.build({
        ...newActionPlanVersion,
        activities: [activity],
      })

      cy.contains('First activity version 1').clear().type('First activity version 2')
      cy.stubUpdateActionPlanActivity(newActionPlanVersion.id, activity.id, actionPlanWithUpdatedActivities)
      cy.contains('Save and add activity 1').click()

      cy.contains('Continue without adding other activities').click()

      cy.get('#number-of-sessions').clear().type('5')

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
})
