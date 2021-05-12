import EndOfServiceReport, { EndOfServiceReportOutcome } from '../../models/endOfServiceReport'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import PresenterUtils from '../../utils/presenterUtils'
import { SummaryListItem } from '../../utils/summaryList'

export type EndOfServiceReportAchievementLevelStyle = 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED'

interface OutcomePresenter {
  title: string
  subtitle: string
  progressionComments: string
  additionalTaskComments: string
  changeHref: string
  achievementLevelText: string
  achievementLevelStyle: EndOfServiceReportAchievementLevelStyle
}

export default class EndOfServiceReportAnswersPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly endOfServiceReport: EndOfServiceReport,
    private readonly serviceCategory: ServiceCategory,
    private readonly allowChange: boolean = true
  ) {}

  readonly interventionSummary: SummaryListItem[] = [
    // TODO IC-1322 Populate this fully
    { key: 'Service user’s name', lines: [PresenterUtils.fullName(this.referral.referral.serviceUser)] },
  ]

  readonly outcomes: OutcomePresenter[] = this.referral.referral.desiredOutcomesIds.map((desiredOutcomeId, index) => {
    const number = index + 1
    const outcome = this.endOfServiceReport.outcomes.find(anOutcome => anOutcome.desiredOutcome.id === desiredOutcomeId)

    if (!outcome) {
      throw new Error(`Outcome not found for desired outcome ${desiredOutcomeId}`)
    }

    const desiredOutcome = this.serviceCategory.desiredOutcomes.find(
      aDesiredOutcome => aDesiredOutcome.id === desiredOutcomeId
    )

    if (!desiredOutcome) {
      throw new Error(`Desired outcome ${desiredOutcomeId} not found`)
    }

    return {
      title: `Outcome ${number}`,
      subtitle: desiredOutcome.description,
      progressionComments: outcome.progressionComments?.length ? outcome.progressionComments : 'None',
      additionalTaskComments: outcome.additionalTaskComments?.length ? outcome.additionalTaskComments : 'None',
      changeHref: `/service-provider/end-of-service-report/${this.endOfServiceReport.id}/outcomes/${number}`,
      achievementLevelText: this.achievementLevelText(outcome),
      achievementLevelStyle: outcome.achievementLevel,
    }
  })

  private achievementLevelText(outcome: EndOfServiceReportOutcome): string {
    switch (outcome.achievementLevel) {
      case 'ACHIEVED':
        return 'Achieved'
      case 'NOT_ACHIEVED':
        return 'Not achieved'
      case 'PARTIALLY_ACHIEVED':
        return 'Partially achieved'
      default:
        return ''
    }
  }

  readonly furtherInformation = {
    text: this.endOfServiceReport.furtherInformation?.length ? this.endOfServiceReport.furtherInformation : 'None',
    changeHref: `/service-provider/end-of-service-report/${this.endOfServiceReport.id}/further-information`,
  }
}
