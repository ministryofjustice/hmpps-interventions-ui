export enum ListStyle {
  noMarkers,
  bulleted,
}

export interface SummaryListItem {
  key: string
  lines: string[]
  listStyle?: ListStyle
  changeLink?: string
  hasRowLabel?: boolean
  isRowLabel?: boolean
}
