import FinaliseActionPlanActivitiesForm from './finaliseActionPlanActivitiesForm'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import actionPlanFactory from '../../../testutils/factories/actionPlan'

describe(FinaliseActionPlanActivitiesForm, () => {
  describe('errors', () => {
    const desiredOutcomes = [
      {
        id: '1',
        description: 'Description 1',
      },
      {
        id: '2',
        description: 'Description 2',
      },
      {
        id: '3',
        description: 'Description 3',
      },
    ]
    const serviceCategory = serviceCategoryFactory.build({ desiredOutcomes })
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        desiredOutcomes: [
          { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id] },
        ],
      },
    })

    describe('when there is an activity in the action plan for every desired outcome of the referral', () => {
      it('returns an empty array', () => {
        const actionPlan = actionPlanFactory.build({
          activities: [
            { id: '1', desiredOutcome: desiredOutcomes[0], createdAt: new Date().toISOString(), description: '' },
            { id: '2', desiredOutcome: desiredOutcomes[1], createdAt: new Date().toISOString(), description: '' },
          ],
        })
        const form = new FinaliseActionPlanActivitiesForm(referral, actionPlan, serviceCategory)

        expect(form.errors).toEqual([])
      })
    })

    describe('when there is a desired outcome in the referral for which there is no activity in the action plan', () => {
      it('returns an error for each outcome without an activity', () => {
        const actionPlan = actionPlanFactory.build({ activities: [] })
        const form = new FinaliseActionPlanActivitiesForm(referral, actionPlan, serviceCategory)

        expect(form.errors).toEqual([
          {
            desiredOutcomeId: '1',
            error: {
              errors: [
                {
                  errorSummaryLinkedField: 'description',
                  formFields: ['description'],
                  message: 'You must add at least one activity for the desired outcome “Description 1”',
                },
              ],
            },
          },
          {
            desiredOutcomeId: '2',
            error: {
              errors: [
                {
                  errorSummaryLinkedField: 'description',
                  formFields: ['description'],
                  message: 'You must add at least one activity for the desired outcome “Description 2”',
                },
              ],
            },
          },
        ])
      })
    })
  })
})
