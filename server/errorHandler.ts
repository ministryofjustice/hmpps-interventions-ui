import type { Request, Response, NextFunction } from 'express'
import createError, { HttpError } from 'http-errors'
import ControllerUtils from './utils/controllerUtils'
import logger from '../log'

export default function createErrorHandler(production: boolean) {
  return (err: Error, req: Request, res: Response, next: NextFunction): void => {
    if (res.headersSent) {
      return next(err)
    }

    if (createError.isHttpError(err)) {
      // authorization errors from interventions service cause a special error page to be displayed
      if (err.status === 403 && err.response?.body?.accessErrors) {
        res.status(403)

        const args = {
          message: err.response?.body?.message,
          accessErrors: err.response?.body?.accessErrors,
        }

        return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/authError', args] }, null)
      }

      // do not propagate external error codes by default (e.g. 404s from interventions service)
      res.status(err.external === true ? 500 : err.status)
    } else {
      res.status(500)
    }

    logger.error(
      {
        err,
        user: req.user?.username,
        url: req.originalUrl,
      },
      'unhandled error'
    )

    const args: Record<string, unknown> = {
      userMessage: (err as HttpError).userMessage || (err as HttpError).response?.body?.userMessage,
    }

    if (!production) {
      args.err = { message: err.message, stack: err.stack, response: (err as HttpError).response?.text }
    }

    return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/unhandledError', args] }, null)
  }
}
