import EndOfServiceReportCheckAnswersPresenter from './endOfServiceReportCheckAnswersPresenter'
import sentReferralFactory from '../../../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../../../testutils/factories/serviceCategory'
import endOfServiceReportFactory from '../../../../../testutils/factories/endOfServiceReport'

describe(EndOfServiceReportCheckAnswersPresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({
    name: 'social inclusion',
    desiredOutcomes: [
      { id: '1', description: 'Description of desired outcome 1' },
      { id: '2', description: 'Description of desired outcome 2' },
      { id: '3', description: 'Description of desired outcome 3' },
    ],
  })
  const referral = sentReferralFactory.build({
    referral: {
      desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['1', '3'] }],
      serviceUser: { firstName: 'Alex', lastName: 'River' },
    },
  })
  const buildEndOfServiceReport = () =>
    endOfServiceReportFactory.build({
      outcomes: [
        {
          desiredOutcome: serviceCategory.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Example progression comments 1',
          additionalTaskComments: 'Example task comments 1',
        },
        {
          desiredOutcome: serviceCategory.desiredOutcomes[2],
          achievementLevel: 'PARTIALLY_ACHIEVED',
          progressionComments: 'Example progression comments 2',
          additionalTaskComments: 'Example task comments 2',
        },
      ],
    })

  describe('text', () => {
    it('returns text to be displayed', () => {
      const presenter = new EndOfServiceReportCheckAnswersPresenter(
        referral,
        buildEndOfServiceReport(),
        [serviceCategory],
        'Personal wellbeing'
      )

      expect(presenter.text).toEqual({
        subTitle: 'Review the end of service report',
      })
    })
  })

  describe('answersPresenter', () => {
    it('returns a presenter', () => {
      const presenter = new EndOfServiceReportCheckAnswersPresenter(
        referral,
        buildEndOfServiceReport(),
        [serviceCategory],
        'Personal wellbeing'
      )

      expect(presenter.answersPresenter).toBeDefined()
    })
  })
})
