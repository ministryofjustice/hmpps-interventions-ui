import EndOfServiceReportAnswersPresenter from './endOfServiceReportAnswersPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'

describe(EndOfServiceReportAnswersPresenter, () => {
  const serviceCategory1 = serviceCategoryFactory.build({
    name: 'social inclusion',
    desiredOutcomes: [
      { id: '1', description: 'Description of desired outcome 1 for social inclusion' },
      { id: '2', description: 'Description of desired outcome 2 for social inclusion' },
      { id: '3', description: 'Description of desired outcome 3 for social inclusion' },
    ],
  })
  const serviceCategory2 = serviceCategoryFactory.build({
    name: 'accommodation',
    desiredOutcomes: [
      { id: '4', description: 'Description of desired outcome 1 for accommodation' },
      { id: '5', description: 'Description of desired outcome 2 for accommodation' },
      { id: '6', description: 'Description of desired outcome 3 for accommodation' },
    ],
  })
  const cohortReferral = sentReferralFactory.build({
    referral: {
      desiredOutcomes: [
        { serviceCategoryId: serviceCategory1.id, desiredOutcomesIds: ['1', '3'] },
        { serviceCategoryId: serviceCategory2.id, desiredOutcomesIds: ['5'] },
      ],
      serviceUser: { firstName: 'Alex', lastName: 'River' },
    },
  })

  const serviceCategories = [serviceCategory1, serviceCategory2]
  const buildEndOfServiceReport = () =>
    endOfServiceReportFactory.build({
      outcomes: [
        {
          desiredOutcome: serviceCategory1.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Example progression comments 1',
          additionalTaskComments: 'Example task comments 1',
        },
        {
          desiredOutcome: serviceCategory1.desiredOutcomes[2],
          achievementLevel: 'PARTIALLY_ACHIEVED',
          progressionComments: 'Example progression comments 2',
          additionalTaskComments: 'Example task comments 2',
        },
        {
          desiredOutcome: serviceCategory2.desiredOutcomes[1],
          achievementLevel: 'PARTIALLY_ACHIEVED',
          progressionComments: 'Example progression comments 3',
          additionalTaskComments: 'Example task comments 3',
        },
      ],
    })

  describe('interventionSummary', () => {
    it('returns a summary of the intervention', () => {
      const presenter = new EndOfServiceReportAnswersPresenter(
        cohortReferral,
        buildEndOfServiceReport(),
        serviceCategories
      )

      expect(presenter.interventionSummary).toEqual([
        {
          key: 'Service user’s name',
          lines: ['Alex River'],
        },
      ])
    })
  })

  describe('outcomes', () => {
    it('replays the user’s outcome answers from the draft end of service report, with a link for changing the answer', () => {
      const endOfServiceReport = buildEndOfServiceReport()
      const presenter = new EndOfServiceReportAnswersPresenter(cohortReferral, endOfServiceReport, serviceCategories)

      expect(presenter.outcomes).toEqual([
        {
          achievementLevelStyle: 'ACHIEVED',
          achievementLevelText: 'Achieved',
          additionalTaskComments: 'Example task comments 1',
          changeHref: `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`,
          progressionComments: 'Example progression comments 1',
          subtitle: 'Description of desired outcome 1 for social inclusion',
          title: 'Outcome 1',
        },
        {
          achievementLevelStyle: 'PARTIALLY_ACHIEVED',
          achievementLevelText: 'Partially achieved',
          additionalTaskComments: 'Example task comments 2',
          changeHref: `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/2`,
          progressionComments: 'Example progression comments 2',
          subtitle: 'Description of desired outcome 3 for social inclusion',
          title: 'Outcome 2',
        },
        {
          achievementLevelStyle: 'PARTIALLY_ACHIEVED',
          achievementLevelText: 'Partially achieved',
          additionalTaskComments: 'Example task comments 3',
          changeHref: `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/3`,
          progressionComments: 'Example progression comments 3',
          subtitle: 'Description of desired outcome 2 for accommodation',
          title: 'Outcome 3',
        },
      ])
    })

    describe('progressionComments', () => {
      it('returns “None” when there are no comments', () => {
        const endOfServiceReport = buildEndOfServiceReport()
        endOfServiceReport.outcomes[0].progressionComments = ''

        const presenter = new EndOfServiceReportAnswersPresenter(cohortReferral, endOfServiceReport, serviceCategories)

        expect(presenter.outcomes[0].progressionComments).toEqual('None')
      })
    })

    describe('additionalTaskComments', () => {
      it('returns “None” when there are no comments', () => {
        const endOfServiceReport = buildEndOfServiceReport()
        endOfServiceReport.outcomes[0].additionalTaskComments = ''

        const presenter = new EndOfServiceReportAnswersPresenter(cohortReferral, endOfServiceReport, serviceCategories)

        expect(presenter.outcomes[0].additionalTaskComments).toEqual('None')
      })
    })
  })

  describe('furtherInformation', () => {
    it('replays the user’s further information answer from the draft end of service report, with a link for changing the answer', () => {
      const endOfServiceReport = buildEndOfServiceReport()
      const presenter = new EndOfServiceReportAnswersPresenter(cohortReferral, endOfServiceReport, serviceCategories)

      expect(presenter.furtherInformation).toEqual({
        changeHref: `/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`,
        text: 'None',
      })
    })

    it('returns “None” for the text when there are no comments', () => {
      const endOfServiceReport = buildEndOfServiceReport()
      endOfServiceReport.furtherInformation = ''

      const presenter = new EndOfServiceReportAnswersPresenter(cohortReferral, endOfServiceReport, serviceCategories)

      expect(presenter.furtherInformation.text).toEqual('None')
    })
  })
})
