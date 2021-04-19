import EndOfServiceReportCheckAnswersPresenter from './endOfServiceReportCheckAnswersPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'

describe(EndOfServiceReportCheckAnswersPresenter, () => {
  const referral = sentReferralFactory.build({
    referral: { desiredOutcomesIds: ['1', '3'], serviceUser: { firstName: 'Alex', lastName: 'River' } },
  })
  const serviceCategory = serviceCategoryFactory.build({
    name: 'social inclusion',
    desiredOutcomes: [
      { id: '1', description: 'Description of desired outcome 1' },
      { id: '2', description: 'Description of desired outcome 2' },
      { id: '3', description: 'Description of desired outcome 3' },
    ],
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
        serviceCategory
      )

      expect(presenter.text).toEqual({
        subTitle: 'Review the end of service report',
      })
    })
  })

  describe('interventionSummary', () => {
    it('returns a summary of the intervention', () => {
      const presenter = new EndOfServiceReportCheckAnswersPresenter(
        referral,
        buildEndOfServiceReport(),
        serviceCategory
      )

      expect(presenter.interventionSummary).toEqual([
        {
          isList: false,
          key: 'Service user’s name',
          lines: ['Alex River'],
        },
      ])
    })
  })

  describe('outcomes', () => {
    it('replays the user’s outcome answers from the draft end of service report, with a link for changing the answer', () => {
      const presenter = new EndOfServiceReportCheckAnswersPresenter(
        referral,
        buildEndOfServiceReport(),
        serviceCategory
      )

      expect(presenter.outcomes).toEqual([
        {
          achievementLevelStyle: 'ACHIEVED',
          achievementLevelText: 'Achieved',
          additionalTaskComments: 'Example task comments 1',
          changeHref: '/service-provider/end-of-service-report/3/outcomes/1',
          progressionComments: 'Example progression comments 1',
          subtitle: 'Description of desired outcome 1',
          title: 'Outcome 1',
        },
        {
          achievementLevelStyle: 'PARTIALLY_ACHIEVED',
          achievementLevelText: 'Partially achieved',
          additionalTaskComments: 'Example task comments 2',
          changeHref: '/service-provider/end-of-service-report/3/outcomes/2',
          progressionComments: 'Example progression comments 2',
          subtitle: 'Description of desired outcome 3',
          title: 'Outcome 2',
        },
      ])
    })

    describe('progressionComments', () => {
      it('returns “None” when there are no comments', () => {
        const endOfServiceReport = buildEndOfServiceReport()
        endOfServiceReport.outcomes[0].progressionComments = ''

        const presenter = new EndOfServiceReportCheckAnswersPresenter(referral, endOfServiceReport, serviceCategory)

        expect(presenter.outcomes[0].progressionComments).toEqual('None')
      })
    })

    describe('additionalTaskComments', () => {
      it('returns “None” when there are no comments', () => {
        const endOfServiceReport = buildEndOfServiceReport()
        endOfServiceReport.outcomes[0].additionalTaskComments = ''

        const presenter = new EndOfServiceReportCheckAnswersPresenter(referral, endOfServiceReport, serviceCategory)

        expect(presenter.outcomes[0].additionalTaskComments).toEqual('None')
      })
    })
  })

  describe('furtherInformation', () => {
    it('replays the user’s further information answer from the draft end of service report, with a link for changing the answer', () => {
      const presenter = new EndOfServiceReportCheckAnswersPresenter(
        referral,
        buildEndOfServiceReport(),
        serviceCategory
      )

      expect(presenter.furtherInformation).toEqual({
        changeHref: '/service-provider/end-of-service-report/6/further-information',
        text: 'None',
      })
    })

    it('returns “None” for the text when there are no comments', () => {
      const endOfServiceReport = buildEndOfServiceReport()
      endOfServiceReport.furtherInformation = ''

      const presenter = new EndOfServiceReportCheckAnswersPresenter(referral, endOfServiceReport, serviceCategory)

      expect(presenter.furtherInformation.text).toEqual('None')
    })
  })
})
