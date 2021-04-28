import DesiredOutcome from './desiredOutcome'

export type AchievementLevel = 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'NOT_ACHIEVED'

export interface EndOfServiceReportOutcome {
  desiredOutcome: DesiredOutcome
  achievementLevel: AchievementLevel
  progressionComments: string
  additionalTaskComments: string
}

export default interface EndOfServiceReport {
  id: string
  referralId: string
  submittedAt: string | null
  furtherInformation: string | null
  outcomes: EndOfServiceReportOutcome[]
}
