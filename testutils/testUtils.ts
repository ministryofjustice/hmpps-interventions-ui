import { SummaryListItem } from '../server/utils/summaryList'

export default class TestUtils {
  static linesForKey(key: string, list: () => SummaryListItem[]): string[] | null {
    const items = list()
    const item = items.find(anItem => anItem.key === key)
    return item?.lines ?? null
  }
}
