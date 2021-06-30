import { Request } from 'express'
import AddActionPlanActivitiesForm from './addActionPlanActivitiesForm'

describe(AddActionPlanActivitiesForm, () => {
  describe('activityParamsForUpdate', () => {
    it('returns the description, when the data in the body is valid', async () => {
      const form = await AddActionPlanActivitiesForm.createForm({
        body: {
          description: 'Attend a training course',
        },
      } as Request)

      expect(form.activityParamsForUpdate).toEqual({
        description: 'Attend a training course',
      })
    })

    it('returns the activity id, if it is present in the request', async () => {
      const form = await AddActionPlanActivitiesForm.createForm({
        body: {
          description: 'Attend a training course',
          'activity-id': '20906bfd-c84d-48a5-9af2-5f3c25ab35ec',
        },
      } as Request)

      expect(form.activityParamsForUpdate).toEqual({
        description: 'Attend a training course',
        id: '20906bfd-c84d-48a5-9af2-5f3c25ab35ec',
      })
    })
  })

  describe('isValid', () => {
    describe('when there is a non-empty text string for "description"', () => {
      it('returns true', async () => {
        const form = await AddActionPlanActivitiesForm.createForm({
          body: {
            description: 'Attend a training course',
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
          },
        } as Request)

        expect(form.isValid).toEqual(false)
      })
    })
  })

  describe('isUpdate', () => {
    it('returns true when there is an activity id', async () => {
      const form = await AddActionPlanActivitiesForm.createForm({
        body: {
          description: 'Attend a training course',
          'activity-id': '123',
        },
      } as Request)

      expect(form.isUpdate).toEqual(true)
    })

    it('returns false when there is no activity id', async () => {
      const form = await AddActionPlanActivitiesForm.createForm({
        body: {
          description: 'Attend a training course',
        },
      } as Request)

      expect(form.isUpdate).toEqual(false)
    })
  })

  describe('error', () => {
    describe('when there is a non-empty text string for "description"', () => {
      it('returns an empty array', async () => {
        const form = await AddActionPlanActivitiesForm.createForm({
          body: {
            description: 'Attend a training course',
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
