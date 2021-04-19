import EndOfServiceReportOutcomePresenter from './endOfServiceReportOutcomePresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import { EndOfServiceReportOutcome } from '../../services/interventionsService'

describe(EndOfServiceReportOutcomePresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
  const desiredOutcome = serviceCategory.desiredOutcomes[0]
  const desiredOutcomeNumber = 1
  const referral = sentReferralFactory.build({ referral: { serviceUser: { firstName: 'Alex' } } })
  const endOfServiceReport = endOfServiceReportFactory.build()

  describe('text', () => {
    it('returns text to be displayed', () => {
      const presenter = new EndOfServiceReportOutcomePresenter(
        referral,
        endOfServiceReport,
        serviceCategory,
        desiredOutcome,
        desiredOutcomeNumber,
        null
      )

      expect(presenter.text).toEqual({
        subTitle: `About desired outcome 1`,
        desiredOutcomeNumberDescription: `Desired outcome 1`,
        desiredOutcomeDescription: desiredOutcome.description,
        achievementLevel: {
          label: `Overall, did Alex achieve desired outcome 1?`,
        },
      })
    })
  })

  describe('fields', () => {
    describe('when there is no existing outcome', () => {
      it('returns blank values and an empty radio button selection', () => {
        const presenter = new EndOfServiceReportOutcomePresenter(
          referral,
          endOfServiceReport,
          serviceCategory,
          desiredOutcome,
          desiredOutcomeNumber,
          null
        )

        expect(presenter.fields).toEqual({
          achievementLevel: {
            errorMessage: null,
            values: [
              {
                selected: false,
                text: 'Achieved',
                value: 'ACHIEVED',
              },
              {
                selected: false,
                text: 'Partially achieved',
                value: 'PARTIALLY_ACHIEVED',
              },
              {
                selected: false,
                text: 'Not achieved',
                value: 'NOT_ACHIEVED',
              },
            ],
          },
          additionalTaskComments: { value: '' },
          progressionComments: { value: '' },
        })
      })
    })

    describe('when there is an existing outcome', () => {
      describe('and there is no user input data', () => {
        it('returns the values from the outcome', () => {
          const outcome: EndOfServiceReportOutcome = {
            desiredOutcome,
            achievementLevel: 'PARTIALLY_ACHIEVED',
            progressionComments: 'Some progression comments',
            additionalTaskComments: 'Some task comments',
          }

          const presenter = new EndOfServiceReportOutcomePresenter(
            referral,
            endOfServiceReport,
            serviceCategory,
            desiredOutcome,
            desiredOutcomeNumber,
            outcome
          )

          expect(presenter.fields).toEqual({
            achievementLevel: {
              errorMessage: null,
              values: [
                {
                  selected: false,
                  text: 'Achieved',
                  value: 'ACHIEVED',
                },
                {
                  selected: true,
                  text: 'Partially achieved',
                  value: 'PARTIALLY_ACHIEVED',
                },
                {
                  selected: false,
                  text: 'Not achieved',
                  value: 'NOT_ACHIEVED',
                },
              ],
            },
            additionalTaskComments: { value: 'Some task comments' },
            progressionComments: { value: 'Some progression comments' },
          })
        })
      })

      describe('and there is user input data', () => {
        it('returns the values from the user input data', () => {
          const outcome: EndOfServiceReportOutcome = {
            desiredOutcome,
            achievementLevel: 'PARTIALLY_ACHIEVED',
            progressionComments: 'Some progression comments',
            additionalTaskComments: 'Some task comments',
          }
          const userInputData = {
            'achievement-level': 'ACHIEVED',
            'progression-comments': 'Some other progression comments',
            'additional-task-comments': 'Some other task comments',
          }

          const presenter = new EndOfServiceReportOutcomePresenter(
            referral,
            endOfServiceReport,
            serviceCategory,
            desiredOutcome,
            desiredOutcomeNumber,
            outcome,
            userInputData
          )

          expect(presenter.fields).toEqual({
            achievementLevel: {
              errorMessage: null,
              values: [
                {
                  selected: true,
                  text: 'Achieved',
                  value: 'ACHIEVED',
                },
                {
                  selected: false,
                  text: 'Partially achieved',
                  value: 'PARTIALLY_ACHIEVED',
                },
                {
                  selected: false,
                  text: 'Not achieved',
                  value: 'NOT_ACHIEVED',
                },
              ],
            },
            additionalTaskComments: { value: 'Some other task comments' },
            progressionComments: { value: 'Some other progression comments' },
          })
        })
      })
    })

    describe('when there is user input data', () => {
      it('returns the values from the user input data', () => {
        const userInputData = {
          'achievement-level': 'ACHIEVED',
          'progression-comments': 'Some other progression comments',
          'additional-task-comments': 'Some other task comments',
        }

        const presenter = new EndOfServiceReportOutcomePresenter(
          referral,
          endOfServiceReport,
          serviceCategory,
          desiredOutcome,
          desiredOutcomeNumber,
          null,
          userInputData
        )

        expect(presenter.fields).toEqual({
          achievementLevel: {
            errorMessage: null,
            values: [
              {
                selected: true,
                text: 'Achieved',
                value: 'ACHIEVED',
              },
              {
                selected: false,
                text: 'Partially achieved',
                value: 'PARTIALLY_ACHIEVED',
              },
              {
                selected: false,
                text: 'Not achieved',
                value: 'NOT_ACHIEVED',
              },
            ],
          },
          additionalTaskComments: { value: 'Some other task comments' },
          progressionComments: { value: 'Some other progression comments' },
        })
      })
    })

    describe('when there is an error on achievement-level', () => {
      it('includes an error message', () => {
        const error = {
          errors: [
            {
              formFields: ['achievement-level'],
              errorSummaryLinkedField: 'achievement-level',
              message: 'Enter an achievement level',
            },
          ],
        }
        const presenter = new EndOfServiceReportOutcomePresenter(
          referral,
          endOfServiceReport,
          serviceCategory,
          desiredOutcome,
          desiredOutcomeNumber,
          null,
          null,
          error
        )

        expect(presenter.fields).toMatchObject({
          achievementLevel: {
            errorMessage: 'Enter an achievement level',
          },
        })
      })
    })
  })

  describe('errorSummary', () => {
    describe('when there is no error', () => {
      it('returns error information', () => {
        const error = {
          errors: [
            {
              formFields: ['achievement-level'],
              errorSummaryLinkedField: 'achievement-level',
              message: 'Enter an achievement level',
            },
          ],
        }
        const presenter = new EndOfServiceReportOutcomePresenter(
          referral,
          endOfServiceReport,
          serviceCategory,
          desiredOutcome,
          desiredOutcomeNumber,
          null,
          null,
          error
        )

        expect(presenter.errorSummary).toEqual([{ field: 'achievement-level', message: 'Enter an achievement level' }])
      })
    })

    describe('when there is an error', () => {
      it('returns null', () => {
        const presenter = new EndOfServiceReportOutcomePresenter(
          referral,
          endOfServiceReport,
          serviceCategory,
          desiredOutcome,
          desiredOutcomeNumber,
          null
        )

        expect(presenter.errorSummary).toBeNull()
      })
    })
  })
})
