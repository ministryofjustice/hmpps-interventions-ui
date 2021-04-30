import { Response } from 'express'
import LayoutPresenter from '../routes/shared/layoutPresenter'
import LayoutView, { PageContentView } from '../routes/shared/layoutView'
import DeliusServiceUser from '../models/delius/deliusServiceUser'

export default class ControllerUtils {
  static renderWithLayout(res: Response, contentView: PageContentView, serviceUser: DeliusServiceUser | null): void {
    const presenter = new LayoutPresenter(res.locals.user, serviceUser)
    const view = new LayoutView(presenter, contentView)

    res.render(...view.renderArgs)
  }
}
