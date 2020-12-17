import * as nunjucks from 'nunjucks'

export default class ViewUtils {
  static escape(val: string): string {
    const escape = new nunjucks.Environment().getFilter('escape')
    return escape(val).val
  }
}
