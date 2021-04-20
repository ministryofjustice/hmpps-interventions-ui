import * as nunjucks from 'nunjucks'
import { SummaryListItem } from './summaryList'
import { ErrorSummaryArgs, SummaryListArgs, TableArgs } from './govukFrontendTypes'

export type SortableTableHeaders = { text: string; sort: 'ascending' | 'descending' | 'none' }[]
export type SortableTableRow = { text: string; sortValue: string | null; href: string | null }[]
export type PrimaryNavItem = { text: string; href: string; active: boolean }

export default class ViewUtils {
  static escape(val: string): string {
    const escape = new nunjucks.Environment().getFilter('escape')
    return escape(val).val
  }

  static govukErrorMessage(message: string | null | undefined): { text: string } | null {
    return message === null || message === undefined ? null : { text: message }
  }

  static govukErrorSummaryArgs(errorSummary: { field: string; message: string }[] | null): ErrorSummaryArgs | null {
    if (errorSummary === null) {
      return null
    }

    return {
      titleText: 'There is a problem',
      errorList: errorSummary.map(error => {
        return {
          text: error.message,
          href: `#${error.field}`,
        }
      }),
    }
  }

  static summaryListArgs(summaryListItems: SummaryListItem[]): SummaryListArgs {
    return {
      rows: summaryListItems.map(item => {
        return {
          key: {
            text: item.key,
          },
          value: (() => {
            if (item.isList) {
              const html = `<ul class="govuk-list">${item.lines
                .map(line => `<li>${ViewUtils.escape(line)}</li>`)
                .join('\n')}</ul>`
              return { html }
            }
            if (item.lines.length > 1) {
              const html = item.lines.map(line => `<p class="govuk-body">${ViewUtils.escape(line)}</p>`).join('\n')
              return { html }
            }
            return { text: item.lines[0] || '' }
          })(),
        }
      }),
    }
  }

  static sortableTable(headers: SortableTableHeaders, rows: SortableTableRow[]): TableArgs {
    return {
      head: headers.map(heading => {
        return {
          text: heading.text,
          attributes: {
            'aria-sort': heading.sort,
          },
        }
      }),
      rows: rows.map(row => {
        return row.map(cell => {
          const result: Record<string, unknown> = {}

          if (cell.sortValue !== null) {
            result.attributes = { 'data-sort-value': cell.sortValue }
          }

          if (cell.href === null) {
            result.text = cell.text
          } else {
            result.html = `<a href="${cell.href}" class="govuk-link">${ViewUtils.escape(cell.text)}</a>`
          }

          return result
        })
      }),
    }
  }

  static primaryNav(items: PrimaryNavItem[]): Record<string, unknown> {
    return {
      label: 'Primary navigation',
      items,
    }
  }
}
