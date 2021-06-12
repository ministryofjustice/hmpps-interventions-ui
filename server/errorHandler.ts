import type { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'
import ControllerUtils from './utils/controllerUtils'

export default function createErrorHandler(production: boolean) {
  return (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // logger.error(
    //   {
    //     err: error,
    //     user: res.locals.user?.username,
    //     url: req.originalUrl,
    //   },
    //   'Error handling request'
    // )
    //
    if (res.headersSent) {
      return next(err)
    }

    if (createError.isHttpError(err)) {
      // errors with specific codes raised within the application
      switch (err.status) {
        case 403: {
          res.status(403)
          return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/authError', {}] }, null)
        }
        case 404: {
          res.status(404)
          return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/notFound', {}] }, null)
        }
        default:
          res.status(err.status)
      }
    } else {
      // other uncaught errors
      res.status(500)
    }

    let args = {}
    if (!production) {
      args = { error: { message: err.message, stack: err.stack } }
    }

    return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/uncaughtError', args] }, null)
  }
}
