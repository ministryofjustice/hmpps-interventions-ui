import { EndOfServiceReport, SentReferral, ServiceCategory } from '../../services/interventionsService'
import EndOfServiceReportAnswersPresenter from '../shared/endOfServiceReportAnswersPresenter'
import EndOfServiceReportFormPresenter from './endOfServiceReportFormPresenter'

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

export default class EndOfServiceReportCheckAnswersPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly endOfServiceReport: EndOfServiceReport,
    private readonly serviceCategory: ServiceCategory
  ) {}

  readonly formAction = `/service-provider/end-of-service-report/${this.endOfServiceReport.id}/submit`

  readonly text = {
    subTitle: 'Review the end of service report',
  }

  readonly formPagePresenter = new EndOfServiceReportFormPresenter(this.serviceCategory, this.referral).checkAnswersPage

  readonly answersPresenter = new EndOfServiceReportAnswersPresenter(
    this.referral,
    this.endOfServiceReport,
    this.serviceCategory
  )
}
