import AddActionPlanActivitiesPresenter from './addActionPlanActivitiesPresenter'
import sentReferralFactory from '../../../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../../../testutils/factories/serviceCategory'
import actionPlanFactory from '../../../../../testutils/factories/actionPlan'

describe(AddActionPlanActivitiesPresenter, () => {
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

  describe('saveAndContinueFormAction', () => {
    it('returns a relative URL of the action plan’s add-activities page', () => {
      const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
      const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, 1)

      expect(presenter.saveAndContinueFormAction).toEqual(
        `/service-provider/action-plan/${actionPlan.id}/add-activities`
      )
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('specifies the number of the activity to be added', () => {
        const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const actionPlan = actionPlanFactory.oneActivityAdded().build()

        const presenter = new AddActionPlanActivitiesPresenter(
          sentReferral,
          [socialInclusionServiceCategory],
          actionPlan,
          3
        )

        expect(presenter.text.title).toEqual('Add activity 3 to action plan')
      })
    })

    describe('referredOutcomesHeader', () => {
      it('includes the name of the service user', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()

        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, 1)

        expect(presenter.text.referredOutcomesHeader).toEqual('Referred outcomes for Jenny')
      })
    })
  })

  describe('addActivityAction', () => {
    it('specifies the number of the activity to be added', () => {
      const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const actionPlan = actionPlanFactory.oneActivityAdded().build()
      const presenter = new AddActionPlanActivitiesPresenter(
        sentReferral,
        [socialInclusionServiceCategory],
        actionPlan,
        2
      )

      expect(presenter.addActivityAction).toEqual(`/service-provider/action-plan/${actionPlan.id}/add-activity/2`)
    })
  })

  describe('errorSummary', () => {
    describe('when an no error is passed in', () => {
      it('returns null', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, 1)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns a summary of the error', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
        const errors = {
          errors: [
            {
              formFields: ['description'],
              errorSummaryLinkedField: 'description',
              message: 'Enter an activity',
            },
          ],
        }

        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, 1, errors)

        expect(presenter.errorSummary).toEqual([{ field: 'description', message: 'Enter an activity' }])
      })
    })
  })

  describe('errorMessage', () => {
    const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
    const errors = {
      errors: [
        {
          formFields: ['description'],
          errorSummaryLinkedField: 'description',
          message: 'Enter an activity',
        },
      ],
    }

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, 1, errors)

        expect(presenter.errorMessage).toEqual('Enter an activity')
      })
    })

    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, 1)

        expect(presenter.errorMessage).toBeNull()
      })
    })
  })

  describe('existingActivity', () => {
    it('is populated when an activity exists for the activity number', () => {
      const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const actionPlan = actionPlanFactory.oneActivityAdded().build()
      const presenter = new AddActionPlanActivitiesPresenter(
        sentReferral,
        [socialInclusionServiceCategory],
        actionPlan,
        1
      )

      expect(presenter.existingActivity).toEqual(actionPlan.activities[0])
    })
  })
})
