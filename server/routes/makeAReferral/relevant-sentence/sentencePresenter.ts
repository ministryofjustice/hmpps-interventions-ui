import moment from 'moment-timezone'
import { DeliusConviction } from '../../../models/delius/deliusConviction'

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
      ? moment(conviction.sentence.expectedEndDate).format('D MMM YYYY')
      : 'Not found'
  }
}
