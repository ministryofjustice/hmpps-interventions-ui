import ReviewActionPlanPresenter from './reviewActionPlanPresenter'
import sentReferralFactory from '../../../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../../../testutils/factories/serviceCategory'
import actionPlanFactory from '../../../../../testutils/factories/actionPlan'

describe(ReviewActionPlanPresenter, () => {
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
  const serviceCategories = [serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })]
  const selectedDesiredOutcomesIds = [desiredOutcomes[0].id, desiredOutcomes[1].id]
  const sentReferral = sentReferralFactory.assigned().build({
    referral: {
      serviceCategoryIds: [serviceCategories[0].id],
      serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      desiredOutcomes: [{ serviceCategoryId: serviceCategories[0].id, desiredOutcomesIds: selectedDesiredOutcomesIds }],
    },
  })

  describe('submitFormAction', () => {
    it('returns a relative URL of the action plan’s submit action', () => {
      const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
      const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategories, actionPlan)

      expect(presenter.submitFormAction).toEqual(`/service-provider/action-plan/${actionPlan.id}/submit`)
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('includes the name of the service category', () => {
        const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
        const presenter = new ReviewActionPlanPresenter(sentReferral, [socialInclusionServiceCategory], actionPlan)

        expect(presenter.text.title).toEqual('Confirm action plan')
      })
    })

    describe('numberOfSessions', () => {
      it('returns the suggested number of sessions in the action plan', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build({ numberOfSessions: 10 })

        const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategories, actionPlan)

        expect(presenter.text.numberOfSessions).toEqual('10')
      })
    })
  })

  describe('desiredOutcomesByServiceCategory', () => {
    it('returns the desired outcomes on the Service Category that match those populated on the SentReferral', () => {
      const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build({ activities: [] })

      const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategories, actionPlan)

      expect(presenter.desiredOutcomesByServiceCategory).toEqual([
        {
          serviceCategory: 'Accommodation',
          desiredOutcomes: [
            'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
            'Service user makes progress in obtaining accommodation',
          ],
        },
      ])
    })
  })

  describe('orderedActivities', () => {
    it('returns the activities specified on the draft action plan in date created order', () => {
      const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build({
        activities: [
          {
            id: '1',
            description: 'description 1',
            createdAt: '2021-03-15T10:05:00Z',
          },
          {
            id: '2',
            description: 'description 2',
            createdAt: '2021-03-15T10:00:00Z',
          },
        ],
      })

      const presenter = new ReviewActionPlanPresenter(sentReferral, serviceCategories, actionPlan)
      expect(presenter.orderedActivities).toEqual(['description 2', 'description 1'])
    })
  })
})
