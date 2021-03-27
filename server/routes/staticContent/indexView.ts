import StaticContentIndexPresenter from './indexPresenter'
import ViewUtils from '../../utils/viewUtils'
import { TableArgs } from '../../utils/govukFrontendTypes'

export default class StaticContentIndexView {
  constructor(private readonly presenter: StaticContentIndexPresenter) {}

  private get tableArgs(): TableArgs {
    return {
      firstCellIsHeader: true,
      head: [{ text: 'Page' }, { text: 'URL' }, { text: 'Template file' }],
      rows: this.presenter.rows.map(row => {
        return [
          { text: row.description },
          { html: `<a href="${row.href}">${ViewUtils.escape(row.href)}</a>` },
          { html: `<code>${ViewUtils.escape(row.template)}</code>` },
        ]
      }),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return ['staticContent/index', { tableArgs: this.tableArgs }]
  }
}
