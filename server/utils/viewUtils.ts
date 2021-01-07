import * as nunjucks from 'nunjucks'

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
}
