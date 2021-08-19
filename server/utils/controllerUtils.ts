import { Request, Response } from 'express'
import createError from 'http-errors'
import LayoutPresenter from '../routes/shared/layoutPresenter'
import LayoutView, { PageContentView } from '../routes/shared/layoutView'
import DeliusServiceUser from '../models/delius/deliusServiceUser'
import DraftsService, { Draft } from '../services/draftsService'

export default class ControllerUtils {
  static renderWithLayout(res: Response, contentView: PageContentView, serviceUser: DeliusServiceUser | null): void {
    const presenter = new LayoutPresenter(res.locals.user, serviceUser)
    const view = new LayoutView(presenter, contentView)

    res.render(...view.renderArgs)
  }

  static async fetchDraft<T>(
    req: Request,
    res: Response,
    draftsService: DraftsService,
    {
      idParamName,
      notFoundUserMessage,
      typeName,
    }: { idParamName: string; notFoundUserMessage: string; typeName: string }
  ): Promise<Draft<T>> {
    const id = req.params[idParamName]
    const draft = await draftsService.fetchDraft<T>(id, {
      userId: res.locals.user.userId,
    })

    if (draft === null) {
      throw createError(500, `Draft ${typeName} with ID ${id} not found by drafts service`, {
        userMessage: notFoundUserMessage,
      })
    }

    return draft
  }
}
