export interface SummaryListItem {
  key: string
  lines: string[]
  isList: boolean
}
export interface SummaryListArgs {
  rows: SummaryListRow[]
}

interface SummaryListRow {
  key: { text: string }
  value: { html?: string; text?: string }
}
