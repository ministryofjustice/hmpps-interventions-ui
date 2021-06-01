import AddActionPlanActivitiesPresenter from './addActionPlanActivitiesPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import actionPlanFactory from '../../../testutils/factories/actionPlan'

describe(AddActionPlanActivitiesPresenter, () => {
  const desiredOutcomes = [
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
      const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan)

      expect(presenter.saveAndContinueFormAction).toEqual(
        `/service-provider/action-plan/${actionPlan.id}/add-activities`
      )
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('includes the name of the service category', () => {
        const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
        const presenter = new AddActionPlanActivitiesPresenter(
          sentReferral,
          [socialInclusionServiceCategory],
          actionPlan
        )

        expect(presenter.text.title).toEqual('Social inclusion - create action plan')
      })
    })

    describe('subTitle', () => {
      it('includes the name of the service user', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()

        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan)

        expect(presenter.text.subTitle).toEqual('Add suggested activities to Jenny’s action plan')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when an empty array of errors is passed in', () => {
      it('returns null', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, [])

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when a non-empty array of errors is passed in', () => {
      it('returns a summary of the errors, with the correct index appended to the field ID', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
        const errors = [
          {
            desiredOutcomeId: desiredOutcomes[0].id,
            error: {
              errors: [
                {
                  formFields: ['description'],
                  errorSummaryLinkedField: 'description',
                  message: 'Enter an activity',
                },
              ],
            },
          },
        ]

        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, errors)

        expect(presenter.errorSummary).toEqual([{ field: 'description-1', message: 'Enter an activity' }])
      })
    })
  })

  describe('desiredOutcomes', () => {
    it('returns the desired outcomes on the Service Category that match those populated on the SentReferral', () => {
      const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build({ activities: [] })

      const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan)

      expect(presenter.desiredOutcomes).toEqual([
        {
          description:
            'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
          addActivityAction: `/service-provider/action-plan/${actionPlan.id}/add-activity`,
          id: selectedDesiredOutcomesIds[0],
          activities: [],
          errorMessage: null,
        },
        {
          description: 'Service User makes progress in obtaining accommodation',
          addActivityAction: `/service-provider/action-plan/${actionPlan.id}/add-activity`,
          id: selectedDesiredOutcomesIds[1],
          activities: [],
          errorMessage: null,
        },
      ])
    })

    describe('activities', () => {
      it('adds the activities to the correct desired outcome', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build({
          activities: [
            {
              id: '1',
              description: 'description 1',
              desiredOutcome: desiredOutcomes[0],
              createdAt: '2021-03-15T10:00:00Z',
            },
            {
              id: '2',
              description: 'description 2',
              desiredOutcome: desiredOutcomes[0],
              createdAt: '2021-03-15T10:00:00Z',
            },
            {
              id: '3',
              description: 'description 3',
              desiredOutcome: desiredOutcomes[1],
              createdAt: '2021-03-15T10:00:00Z',
            },
          ],
        })

        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan)
        expect(presenter.desiredOutcomes).toMatchObject([
          { activities: [{ text: 'description 1' }, { text: 'description 2' }] },
          { activities: [{ text: 'description 3' }] },
        ])
      })

      it('sorts an outcome’s referrals into oldest-to-newest order', () => {
        const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build({
          activities: [
            {
              id: '1',
              description: 'description 1',
              desiredOutcome: desiredOutcomes[0],
              createdAt: '2021-03-15T10:05:00Z',
            },
            {
              id: '2',
              description: 'description 2',
              desiredOutcome: desiredOutcomes[0],
              createdAt: '2021-03-15T10:00:00Z',
            },
          ],
        })

        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan)
        expect(presenter.desiredOutcomes[0]).toMatchObject({
          activities: [{ text: 'description 2' }, { text: 'description 1' }],
        })
      })
    })

    describe('errorMessage', () => {
      const actionPlan = actionPlanFactory.justCreated(sentReferral.id).build()
      const errors = [
        {
          desiredOutcomeId: desiredOutcomes[0].id,
          error: {
            errors: [
              {
                formFields: ['description'],
                errorSummaryLinkedField: 'description',
                message: 'Enter an activity',
              },
            ],
          },
        },
      ]

      const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategories, actionPlan, errors)

      describe('when there is an error on the description field for that desired outcome', () => {
        it('returns that error’s message', () => {
          expect(presenter.desiredOutcomes[0]?.errorMessage).toEqual('Enter an activity')
        })
      })

      describe('when there is no error for that desired outcome', () => {
        it('returns null', () => {
          expect(presenter.desiredOutcomes[1]?.errorMessage).toBeNull()
        })
      })
    })
  })
})
