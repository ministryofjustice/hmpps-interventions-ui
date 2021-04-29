import LayoutPresenter from './layoutPresenter'

export interface PageContentView {
  renderArgs: [string, Record<string, unknown>]
}

export default class LayoutView {
  constructor(private readonly presenter: LayoutPresenter, private readonly content: PageContentView) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return this.content.renderArgs
  }
}
