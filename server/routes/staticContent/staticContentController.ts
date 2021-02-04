import { Request, Response } from 'express'
import StaticContentIndexPresenter from './indexPresenter'
import StaticContentIndexView from './indexView'

export default class StaticContentController {
  private static pages: { path: string; template: string; description: string }[] = [
    {
      path: '/service-provider/session-progress',
      template: 'serviceProviderReferrals/sessionProgress',
      description: 'IC-1052 (session progress)',
    },
  ]

  static get allPaths(): string[] {
    return this.pages.map(page => page.path)
  }

  async index(req: Request, res: Response): Promise<void> {
    const presenter = new StaticContentIndexPresenter(StaticContentController.pages)
    const view = new StaticContentIndexView(presenter)

    res.render(...view.renderArgs)
  }

  async renderStaticPage(req: Request, res: Response): Promise<void> {
    const page = StaticContentController.pages.find(aPage => aPage.path === req.path)

    if (page === undefined) {
      throw new Error(`No static page found for path ${req.path}`)
    }

    res.render(page.template)
  }
}
