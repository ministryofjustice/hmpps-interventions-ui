import type { Request, Response, NextFunction } from 'express'
import createError, { HttpError } from 'http-errors'
import ControllerUtils from './utils/controllerUtils'
import logger from '../log'

export default function createErrorHandler(production: boolean) {
  return (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
      return next(err)
    }

    // authorization errors cause a special error page to be displayed
    if (createError.isHttpError(err) && err.status === 403) {
      res.status(403)

      const args: Record<string, unknown> = { message: err.message }

      // 403 responses from the interventions service contain further information in the
      // response; if it's present, the authError template surfaces this to the end user
      if (err.response) {
        args.message = err.response.body?.message || args.message
        args.accessErrors = err.response.body?.accessErrors
      }

      return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/authError', args] }, null)
    }

    logger.error(
      {
        err,
        user: req.user?.username,
        url: req.originalUrl,
      },
      'unhandled error'
    )

    res.status(500)

    const args: Record<string, unknown> = {
      userMessage: (err as HttpError).response?.body?.userMessage,
    }

    if (!production) {
      args.err = { message: err.message, stack: err.stack, response: (err as HttpError).response?.text }
    }

    return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/unhandledError', args] }, null)
  }
}
