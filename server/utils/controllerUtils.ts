import { Response } from 'express'
import LayoutPresenter from '../routes/shared/layoutPresenter'
import LayoutView, { PageContentView } from '../routes/shared/layoutView'
import { DeliusServiceUser } from '../services/communityApiService'

export default class ControllerUtils {
  static renderWithLayout(res: Response, contentView: PageContentView, serviceUser: DeliusServiceUser | null): void {
    const presenter = new LayoutPresenter(serviceUser)
    const view = new LayoutView(presenter, contentView)

    res.render(...view.renderArgs)
  }
}
