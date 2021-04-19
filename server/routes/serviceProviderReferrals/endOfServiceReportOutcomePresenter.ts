import {
  DesiredOutcome,
  EndOfServiceReport,
  EndOfServiceReportOutcome,
  SentReferral,
  ServiceCategory,
} from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import EndOfServiceReportFormPresenter from './endOfServiceReportFormPresenter'

export default class EndOfServiceReportOutcomePresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly endOfServiceReport: EndOfServiceReport,
    private readonly serviceCategory: ServiceCategory,
    private readonly desiredOutcome: DesiredOutcome,
    private readonly desiredOutcomeNumber: number,
    private readonly outcome: EndOfServiceReportOutcome | null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly error: FormValidationError | null = null
  ) {}

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly text = {
    subTitle: `About desired outcome ${this.desiredOutcomeNumber}`,
    desiredOutcomeNumberDescription: `Desired outcome ${this.desiredOutcomeNumber}`,
    desiredOutcomeDescription: this.desiredOutcome.description,
    achievementLevel: {
      label: `Overall, did ${this.referral.referral.serviceUser.firstName} achieve desired outcome ${this.desiredOutcomeNumber}?`,
    },
  }

  readonly formPagePresenter = new EndOfServiceReportFormPresenter(
    this.serviceCategory,
    this.referral
  ).desiredOutcomePage(this.desiredOutcomeNumber)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    achievementLevel: {
      errorMessage: PresenterUtils.errorMessage(this.error, 'achievement-level'),
      values: [
        { text: 'Achieved', value: 'ACHIEVED' },
        { text: 'Partially achieved', value: 'PARTIALLY_ACHIEVED' },
        { text: 'Not achieved', value: 'NOT_ACHIEVED' },
      ].map(option => ({
        ...option,
        selected: this.utils.stringValue(this.outcome?.achievementLevel ?? null, 'achievement-level') === option.value,
      })),
    },
    progressionComments: {
      value: this.utils.stringValue(this.outcome?.progressionComments ?? null, 'progression-comments'),
    },
    additionalTaskComments: {
      value: this.utils.stringValue(this.outcome?.additionalTaskComments ?? null, 'additional-task-comments'),
    },
  }
}
