import ActionPlanNumberOfSessionsPresenter from './actionPlanNumberOfSessionsPresenter'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe(ActionPlanNumberOfSessionsPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const presenter = new ActionPlanNumberOfSessionsPresenter(
        actionPlanFactory.build({ numberOfSessions: 10 }),
        serviceUserFactory.build({ firstName: 'Alex', surname: 'River' }),
        serviceCategoryFactory.build({ name: 'accommodation' })
      )

      expect(presenter.text).toMatchObject({
        pageNumber: 2,
        serviceCategoryName: 'Accommodation',
        serviceUserFirstName: 'Alex',
        title: 'Accommodation - create action plan',
      })
    })

    describe('numberOfSessions.errorMessage', () => {
      describe('when there is an error', () => {
        it('returns a description of the error', () => {
          const presenter = new ActionPlanNumberOfSessionsPresenter(
            actionPlanFactory.build(),
            serviceUserFactory.build(),
            serviceCategoryFactory.build(),
            {
              errors: [
                {
                  formFields: ['number-of-sessions'],
                  errorSummaryLinkedField: 'number-of-sessions',
                  message: 'Enter the number of sessions',
                },
              ],
            }
          )

          expect(presenter.text.numberOfSessions.errorMessage).toEqual('Enter the number of sessions')
        })
      })

      describe('when there is no error', () => {
        it('returns null', () => {
          const presenter = new ActionPlanNumberOfSessionsPresenter(
            actionPlanFactory.build(),
            serviceUserFactory.build(),
            serviceCategoryFactory.build(),
            null
          )

          expect(presenter.text.numberOfSessions.errorMessage).toBeNull()
        })
      })
    })
  })

  describe('errorSummary', () => {
    describe('when there is an error', () => {
      it('returns a summary of the error', () => {
        const presenter = new ActionPlanNumberOfSessionsPresenter(
          actionPlanFactory.build(),
          serviceUserFactory.build(),
          serviceCategoryFactory.build(),
          {
            errors: [
              {
                formFields: ['number-of-sessions'],
                errorSummaryLinkedField: 'number-of-sessions',
                message: 'Enter the number of sessions',
              },
            ],
          }
        )

        expect(presenter.errorSummary).toEqual([
          { field: 'number-of-sessions', message: 'Enter the number of sessions' },
        ])
      })
    })

    describe('when there is no error', () => {
      it('returns null', () => {
        const presenter = new ActionPlanNumberOfSessionsPresenter(
          actionPlanFactory.build(),
          serviceUserFactory.build(),
          serviceCategoryFactory.build(),
          null
        )

        expect(presenter.errorSummary).toBeNull()
      })
    })
  })

  describe('fields.numberOfSessions', () => {
    describe('when there is user input data', () => {
      it('returns the user input value', () => {
        const presenter = new ActionPlanNumberOfSessionsPresenter(
          actionPlanFactory.build({ numberOfSessions: 10 }),
          serviceUserFactory.build(),
          serviceCategoryFactory.build(),
          null,
          { 'number-of-sessions': '4' }
        )

        expect(presenter.fields.numberOfSessions).toEqual('4')
      })
    })

    describe('when there is no user input data', () => {
      it('returns the action plan value', () => {
        const actionPlan = actionPlanFactory.build({ numberOfSessions: 10 })
        const presenter = new ActionPlanNumberOfSessionsPresenter(
          actionPlan,
          serviceUserFactory.build(),
          serviceCategoryFactory.build(),
          null,
          null
        )

        expect(presenter.fields.numberOfSessions).toEqual('10')
      })
    })
  })
})
