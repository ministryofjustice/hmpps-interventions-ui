import { Request } from 'express'
import AddActionPlanActivitiesForm from './addActionPlanActivitiesForm'

describe(AddActionPlanActivitiesForm, () => {
  describe('activityParamsForUpdate', () => {
    it('returns the params to be sent to the backend, when the data in the body is valid', async () => {
      const form = await AddActionPlanActivitiesForm.createForm({
        body: {
          description: 'Attend a training course',
          'desired-outcome-id': '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
        },
      } as Request)

      expect(form.activityParamsForUpdate).toEqual({
        newActivity: {
          description: 'Attend a training course',
          desiredOutcomeId: '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
        },
      })
    })
  })

  describe('isValid', () => {
    describe('when there is a non-empty text string for "description"', () => {
      it('returns true', async () => {
        const form = await AddActionPlanActivitiesForm.createForm({
          body: {
            description: 'Attend a training course',
            'desired-outcome-id': '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
          },
        } as Request)

        expect(form.isValid).toEqual(true)
      })
    })

    describe('when there is an empty string for "description"', () => {
      it('returns false', async () => {
        const form = await AddActionPlanActivitiesForm.createForm({
          body: {
            description: '',
            'desired-outcome-id': '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
          },
        } as Request)

        expect(form.isValid).toEqual(false)
      })
    })
  })

  describe('error', () => {
    describe('when there is a non-empty text string for "description"', () => {
      it('returns an empty array', async () => {
        const form = await AddActionPlanActivitiesForm.createForm({
          body: {
            description: 'Attend a training course',
            'desired-outcome-id': '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
          },
        } as Request)

        expect(form.error).toEqual(null)
      })
    })

    describe('when there is an empty string for "description"', () => {
      it('returns an error', async () => {
        const form = await AddActionPlanActivitiesForm.createForm({
          body: {
            description: '',
            'desired-outcome-id': '29843fdf-8b88-4b08-a0f9-dfbd3208fd2e',
          },
        } as Request)

        expect(form.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'description',
              formFields: ['description'],
              message: 'Enter an activity',
            },
          ],
        })
      })
    })
  })
})
