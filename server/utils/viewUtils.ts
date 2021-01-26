import * as nunjucks from 'nunjucks'
import { SummaryListArgs, SummaryListItem } from './summaryList'

export default class ViewUtils {
  static escape(val: string): string {
    const escape = new nunjucks.Environment().getFilter('escape')
    return escape(val).val
  }

  static govukErrorMessage(message: string | null | undefined): { text: string } | null {
    return message === null || message === undefined ? null : { text: message }
  }

  static govukErrorSummaryArgs(
    errorSummary: { field: string; message: string }[] | null
  ): Record<string, unknown> | null {
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
}
