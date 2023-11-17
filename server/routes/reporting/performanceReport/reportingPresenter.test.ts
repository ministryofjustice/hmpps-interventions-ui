import ReportingPresenter from './reportingPresenter'
import loggedInUserFactory from '../../../../testutils/factories/loggedInUser'

describe(ReportingPresenter, () => {
  const loggedInUser = loggedInUserFactory.crsServiceProviderUser().build()

  describe('text', () => {
    it('has a title and subtitle', () => {
      const presenter = new ReportingPresenter(loggedInUser)

      expect(presenter.text).toMatchObject({
        title: 'Reporting',
        subtitle: 'Download a CSV of case data from this service. You can download up to 6 months data per search.',
        hint: 'For example, 11 12 2020',
      })
    })
  })

  describe('fields', () => {
    describe('fromDate', () => {
      describe('when no user information has been entered', () => {
        it('uses the default value set', () => {
          const presenter = new ReportingPresenter(loggedInUser)
          expect(presenter.fields.fromDate.day.value).toEqual('')
          expect(presenter.fields.fromDate.month.value).toEqual('')
          expect(presenter.fields.fromDate.year.value).toEqual('')
        })
      })

      describe('when there is user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new ReportingPresenter(loggedInUser, null, {
            'from-date-day': '01',
            'from-date-month': '06',
            'from-date-year': '2021',
          })

          expect(presenter.fields.fromDate.day.value).toEqual('01')
          expect(presenter.fields.fromDate.month.value).toEqual('06')
          expect(presenter.fields.fromDate.year.value).toEqual('2021')
        })
      })
    })

    describe('toDate', () => {
      describe('when no user information has been entered', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new ReportingPresenter(loggedInUser)

          expect(presenter.fields.toDate.day.value).toEqual('')
          expect(presenter.fields.toDate.month.value).toEqual('')
          expect(presenter.fields.toDate.year.value).toEqual('')
        })
      })

      describe('when there is user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new ReportingPresenter(loggedInUser, null, {
            'to-date-day': '01',
            'to-date-month': '06',
            'to-date-year': '2021',
          })

          expect(presenter.fields.toDate.day.value).toEqual('01')
          expect(presenter.fields.toDate.month.value).toEqual('06')
          expect(presenter.fields.toDate.year.value).toEqual('2021')
        })
      })
    })
  })

  describe('error information', () => {
    describe('when a null error is passed in', () => {
      it('returns no errors', () => {
        const presenter = new ReportingPresenter(loggedInUser)

        expect(presenter.errorSummary).toBeNull()
        expect(presenter.fields.fromDate.errorMessage).toEqual(null)
        expect(presenter.fields.toDate.errorMessage).toEqual(null)
      })
    })

    describe('when a non-null error is passed in', () => {
      it('returns error information', () => {
        const presenter = new ReportingPresenter(loggedInUser, {
          errors: [
            {
              errorSummaryLinkedField: 'to-date-month',
              formFields: ['to-date-month', 'to-date-year'],
              message: 'The "to" date must include a month',
            },
          ],
        })

        expect(presenter.fields.toDate.month.hasError).toEqual(true)
        expect(presenter.fields.toDate.errorMessage).toEqual('The "to" date must include a month')
        expect(presenter.errorSummary).toEqual([
          { message: 'The "to" date must include a month', field: 'to-date-month' },
        ])
      })
    })
  })
})
