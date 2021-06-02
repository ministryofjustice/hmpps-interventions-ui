import DeliusConviction from '../../models/delius/deliusConviction'
import DraftReferral from '../../models/draftReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import Intervention from '../../models/intervention'
import utils from '../../utils/utils'

export default class RelevantSentencePresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
    private readonly convictions: DeliusConviction[],
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly title = `Select the relevant sentence for the ${utils.convertToProperCase(
    this.intervention.contractType.name
  )} referral`

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'relevant-sentence-id')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  get relevantSentenceFields(): {
    category: string
    subcategory: string
    endOfSentenceDate: string
    value: number
    checked: boolean
  }[] {
    return this.convictions.map(conviction => {
      if (!conviction.offences) {
        throw new Error(`No offences found for conviction id: ${conviction.convictionId}`)
      }

      const mainOffence = conviction.offences.find(offence => offence.mainOffence)

      if (!mainOffence) {
        throw new Error('No main offence found')
      }

      return {
        category: mainOffence.detail.mainCategoryDescription,
        subcategory: mainOffence.detail.subCategoryDescription,
        endOfSentenceDate:
          PresenterUtils.govukFormattedDateFromStringOrNull(conviction.sentence.expectedSentenceEndDate) ?? 'Not found',
        value: conviction.convictionId,
        checked: this.selectedRelevantSentenceId === conviction.convictionId,
      }
    })
  }

  private get selectedRelevantSentenceId() {
    return this.userInputData ? this.userInputData['relevant-sentence-id'] : this.referral.relevantSentenceId
  }
}
