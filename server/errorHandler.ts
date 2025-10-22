import type { Request, Response, NextFunction } from 'express'
import createError, { HttpError } from 'http-errors'
import ControllerUtils from './utils/controllerUtils'
import logger from '../log'
import config from './config'
import errorMessages from './utils/errorMessages'

export default function createErrorHandler(production: boolean) {
  return async (err: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (res.headersSent) {
      return next(err)
    }
    // Added so exceptions are visible in tests to help with debugging.
    if (config.testMode) {
      // eslint-disable-next-line no-console
      console.log(err)
    }

    if (createError.isHttpError(err)) {
      // authorization errors from interventions service cause a special error page to be displayed
      if (err.status === 403 && (!err.external || err.response?.body?.accessErrors)) {
        res.status(403)

        const returnedError = err.response?.body?.message
        let userMessage
        let userHeader

        const userHeaderTypes = {
          userHeaderService: 'You do not have permission to view this service',
          userHeaderPage: 'You do not have permission to view this page',
        }

        const lookupError = errorMessages.returnedError[returnedError]
        if (lookupError) {
          userMessage = lookupError.mappedMessage
          userHeader = userHeaderTypes[lookupError.userHeaderType]
        } else if (returnedError?.includes('unidentified provider')) {
          userMessage = errorMessages.errorHandlerAccessErrorMessages.providerGroupNotRecognised
          userHeader = userHeaderTypes.userHeaderService
        } else if (returnedError?.includes('unidentified contract')) {
          userMessage = errorMessages.errorHandlerAccessErrorMessages.contractGroupNotRecognised
          userHeader = userHeaderTypes.userHeaderService
        } else if (returnedError?.includes('is not accessible to providers')) {
          userMessage = errorMessages.errorHandlerAccessErrorMessages.groupsDoNotMatch
          userHeader = userHeaderTypes.userHeaderService
        }

        const args = {
          userHeader,
          userMessage,
        }

        return ControllerUtils.renderWithLayout(req, res, { renderArgs: ['errors/authError', args] }, null, null)
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

    return ControllerUtils.renderWithLayout(req, res, { renderArgs: ['errors/unhandledError', args] }, null, null)
  }
}
