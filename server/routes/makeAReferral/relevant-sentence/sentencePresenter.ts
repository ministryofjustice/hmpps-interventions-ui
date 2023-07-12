import { DeliusConviction } from '../../../models/delius/deliusConviction'
import DateUtils from '../../../utils/dateUtils'

export default class SentencePresenter {
  readonly category: string

  readonly subcategory: string

  readonly endOfSentenceDate: string

  constructor(private readonly conviction: DeliusConviction) {
    const { mainOffence } = conviction

    if (!mainOffence) {
      throw new Error('No main offence found')
    }

    this.category = mainOffence.category
    this.subcategory = mainOffence.subCategory

    this.endOfSentenceDate = conviction?.sentence?.expectedEndDate
      ? DateUtils.formattedDate(new Date(conviction.sentence.expectedEndDate), { month: 'short' })
      : 'Not found'
  }
}
