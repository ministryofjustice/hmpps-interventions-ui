import DeliusConviction from '../../../models/delius/deliusConviction'
import PresenterUtils from '../../../utils/presenterUtils'

export default class SentencePresenter {
  readonly category: string

  readonly subcategory: string

  readonly endOfSentenceDate: string

  constructor(private readonly conviction: DeliusConviction) {
    if (!conviction.offences) {
      throw new Error(`No offences found for conviction id: ${conviction.convictionId}`)
    }

    const mainOffence = conviction.offences.find(offence => offence.mainOffence)

    if (!mainOffence) {
      throw new Error('No main offence found')
    }

    this.category = mainOffence.detail.mainCategoryDescription
    this.subcategory = mainOffence.detail.subCategoryDescription

    this.endOfSentenceDate =
      PresenterUtils.govukFormattedDateFromStringOrNull(this.conviction.sentence.expectedSentenceEndDate) ?? 'Not found'
  }
}
