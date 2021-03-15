export interface TabsArgs {
  items: TabItem[]
}

interface TabItem {
  id: string
  label: string
  panel: {
    text?: string
    html?: string
  }
}

export interface InputArgs {
  id: string
  name: string
  label: {
    text?: string
    html?: string
    classes?: string
  }
  classes?: string
  inputmode?: string
  pattern?: string
  spellcheck?: boolean
  autocomplete?: string
  errorMessage?: {
    text: string
  } | null
  value?: string
}

export interface PanelArgs {
  titleText: string
}

export interface SummaryListArgs {
  rows: SummaryListRow[]
}

export interface SummaryListRow {
  key: { text: string }
  value: { html?: string; text?: string }
}

export interface TagArgs {
  text: string
  classes?: string
  attributes?: Record<string, string>
}

interface TableRowItem {
  text?: string
  html?: string
}

export type TableRows = TableRowItem[][]

export interface TableArgs {
  head: TableRowItem[]
  rows: TableRows
}
