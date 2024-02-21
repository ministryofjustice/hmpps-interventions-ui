import AuthUserDetails from '../models/hmppsAuth/authUserDetails'

export enum ListStyle {
  noMarkers,
  bulleted,
}

export type SummaryListItemContent = string | AuthUserDetails

export interface SummaryListItem {
  key: string
  lines: SummaryListItemContent[]
  listStyle?: ListStyle
  changeLink?: string
  deleteLink?: string
  valueLink?: string
}
