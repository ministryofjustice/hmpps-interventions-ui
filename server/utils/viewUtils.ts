import * as nunjucks from 'nunjucks'
import { ListStyle, SummaryListItem } from './summaryList'
import { ErrorSummaryArgs, SummaryListArgs, TableArgs, TagArgs } from './govukFrontendTypes'
import SessionStatusPresenter from '../routes/shared/sessionStatusPresenter'
import { PrimaryNavBarItem } from '../routes/shared/primaryNavBar/primaryNavBarPresenter'

export type SortableTableHeaders = { text: string; sort: 'ascending' | 'descending' | 'none'; persistentId: string }[]
export type SortableTableRow = { text: string; sortValue: string | null; href: string | null }[]

export default class ViewUtils {
  static escape(val: string): string {
    const escape = new nunjucks.Environment().getFilter('escape')
    return escape(val).val
  }

  static nl2br(val: string): string {
    // this is a weird condition - but it's possible to trick the compiler into letting you call this method
    // with non string objects via the template callback mechanism we have for govuk frontend macros.
    // in that instance the type of val is a nunjucks `SafeString`, and everything still works as expected.
    if (typeof val !== 'string') return val

    const nl2br = new nunjucks.Environment().getFilter('nl2br')
    return nl2br(val)
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

  static summaryListArgs(
    summaryListItems: SummaryListItem[],
    options: { showBorders: boolean } = { showBorders: true }
  ): SummaryListArgs {
    return {
      classes: options.showBorders ? undefined : 'govuk-summary-list--no-border',
      rows: summaryListItems.map(item => {
        return {
          key: {
            text: item.key,
          },
          value: (() => {
            if (item.listStyle !== undefined) {
              const itemClass = `govuk-list${item.listStyle === ListStyle.bulleted ? ' govuk-list--bullet' : ''}`
              const html = `<ul class="${itemClass}">${item.lines
                .map(line => `<li>${ViewUtils.escape(line)}</li>`)
                .join('\n')}</ul>`
              return { html }
            }

            const html = item.lines
              .map(line => `<p class="govuk-body">${ViewUtils.nl2br(ViewUtils.escape(line))}</p>`)
              .join('\n')
            return { html }
          })(),
          actions: (() => {
            if (item.changeLink) {
              return {
                items: [
                  {
                    href: item.changeLink,
                    text: 'Change',
                  },
                ],
              }
            }
            return null
          })(),
        }
      }),
    }
  }

  static sortableTable(
    persistentId: string,
    headers: SortableTableHeaders,
    rows: SortableTableRow[],
    options?: { secondOrderColumnNumber?: number }
  ): TableArgs {
    const tableAttributes = { 'data-persistent-id': persistentId }
    if (options && options.secondOrderColumnNumber !== undefined) {
      tableAttributes['second-order-column'] = options.secondOrderColumnNumber
    }
    return {
      attributes: tableAttributes,
      head: headers.map(heading => {
        return {
          text: heading.text,
          attributes: {
            'aria-sort': heading.sort,
            'data-persistent-id': heading.persistentId,
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

  static primaryNav(items: PrimaryNavBarItem[]): Record<string, unknown> {
    return {
      label: 'Primary navigation',
      containerClasses: 'refer-and-monitor__primary-navigation',
      items,
    }
  }

  static linkHtml(links: { text: string; href: string; hiddenText?: string }[]): string {
    return links
      .map(link => {
        const hiddenLinkHtml = link.hiddenText
          ? `<span class="govuk-visually-hidden">${ViewUtils.escape(link.hiddenText)}</span>`
          : ''

        return `<a class="govuk-link" href="${ViewUtils.escape(link.href)}">${ViewUtils.escape(
          link.text
        )}${hiddenLinkHtml}</a>`
      })
      .join('<br>')
  }

  static sessionStatusTagHtml(presenter: SessionStatusPresenter, tagMacro: (args: TagArgs) => string): string {
    return tagMacro({ text: presenter.text, classes: presenter.tagClass })
  }
}
