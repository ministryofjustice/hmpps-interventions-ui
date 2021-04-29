import { Response } from 'express'
import LayoutPresenter from '../routes/shared/layoutPresenter'
import LayoutView, { PageContentView } from '../routes/shared/layoutView'

export default class ControllerUtils {
  static renderWithLayout(res: Response, contentView: PageContentView): void {
    const presenter = new LayoutPresenter()
    const view = new LayoutView(presenter, contentView)

    res.render(...view.renderArgs)
  }
}
