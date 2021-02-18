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
  }
}
