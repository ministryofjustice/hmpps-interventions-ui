import type { Request, Response, NextFunction } from 'express'

export enum ErrorType {
  REQUIRES_SP_USER,
  REQUIRES_PP_USER,
  NO_SP_ORG,
  INVALID_ROLES,
}

export class AuthError extends Error {
  constructor(readonly type: ErrorType) {
    super()
  }
}

export default function authErrorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof AuthError) {
    const { status, message } = {
      [ErrorType.REQUIRES_SP_USER]: {
        status: 403,
        message: 'Only service providers can view this page.',
      },
      [ErrorType.REQUIRES_PP_USER]: {
        status: 403,
        message: 'Only probation practitioners can view this page.',
      },
      [ErrorType.NO_SP_ORG]: {
        status: 403,
        message: 'Your user account is not associated with a service provider organisation.',
      },
      [ErrorType.INVALID_ROLES]: {
        status: 403,
        message: 'You do not have the required permissions to view this page.',
      },
    }[err.type] ?? { status: 401, message: '' }

    res.status(status)
    return res.render('autherror', { message })
  }

  return next(err)
}
