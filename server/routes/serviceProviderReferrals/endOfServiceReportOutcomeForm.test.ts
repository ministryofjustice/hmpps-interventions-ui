import EndOfServiceReportOutcomeForm from './endOfServiceReportOutcomeForm'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import TestUtils from '../../../testutils/testUtils'

describe(EndOfServiceReportOutcomeForm, () => {
  const { serviceUser } = sentReferralFactory.build({ referral: { serviceUser: { firstName: 'Alex' } } }).referral

  describe('data', () => {
    describe('with an empty achievement-level', () => {
      it('returns an error', async () => {
        const body = {
          'achievement-level': '',
        }
        const data = await new EndOfServiceReportOutcomeForm(
          TestUtils.createRequest(body),
          'abc123',
          serviceUser
        ).data()

        expect(data).toEqual({
          paramsForUpdate: null,
          error: {
            errors: [
              {
                errorSummaryLinkedField: 'achievement-level',
                formFields: ['achievement-level'],
                message: 'Select whether Alex achieved the desired outcome',
              },
            ],
          },
        })
      })
    })

    describe('with valid data', () => {
      describe('with all fields populated', () => {
        it('returns params for updating the outcome', async () => {
          const body = {
            'achievement-level': 'ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some task comments',
          }
          const data = await new EndOfServiceReportOutcomeForm(
            TestUtils.createRequest(body),
            'abc123',
            serviceUser
          ).data()

          expect(data).toEqual({
            error: null,
            paramsForUpdate: {
              outcome: {
                desiredOutcomeId: 'abc123',
                achievementLevel: 'ACHIEVED',
                progressionComments: 'Some progression comments',
                additionalTaskComments: 'Some task comments',
              },
            },
          })
        })
      })

      describe('with optional fields empty', () => {
        it('returns params for updating the outcome', async () => {
          const body = {
            'achievement-level': 'ACHIEVED',
            'progression-comments': '',
            'additional-task-comments': '',
          }
          const data = await new EndOfServiceReportOutcomeForm(
            TestUtils.createRequest(body),
            'abc123',
            serviceUser
          ).data()

          expect(data).toEqual({
            error: null,
            paramsForUpdate: {
              outcome: {
                desiredOutcomeId: 'abc123',
                achievementLevel: 'ACHIEVED',
                progressionComments: '',
                additionalTaskComments: '',
              },
            },
          })
        })
      })
    })
  })
})
