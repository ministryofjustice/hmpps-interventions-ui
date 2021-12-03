import { Request } from 'express'
import { SummaryListItem, SummaryListItemContent } from '../server/utils/summaryList'

export default class TestUtils {
  static linesForKey(key: string, list: () => SummaryListItem[]): SummaryListItemContent[] | null {
    const items = list()
    const item = items.find(anItem => anItem.key === key)
    return item?.lines ?? null
  }

  static createRequest = (body: Record<string, unknown>): Request => {
    return { body } as Request
  }
}
