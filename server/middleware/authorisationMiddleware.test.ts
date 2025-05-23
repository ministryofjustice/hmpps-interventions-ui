import { Request, Response } from 'express'

import authorisationMiddleware from './authorisationMiddleware'

describe('authorisationMiddleware', () => {
  const next = jest.fn()

  function createReqWithAuth(authenticated: boolean): Request {
    return {
      isAuthenticated: () => authenticated,
    } as unknown as Request
  }

  function createResWithToken(authorities: string[] = []): Response {
    return {
      locals: {
        user: {
          token: {
            roles: authorities,
          },
        },
      },
      render: (template: string) => {
        return template
      },
      status: jest.fn(),
    } as unknown as Response
  }

  it('should return next when no required roles', () => {
    const req = createReqWithAuth(true)
    const res = createResWithToken()

    const authorisationResponse = authorisationMiddleware()(req, res, next)

    expect(authorisationResponse).toEqual(next())
  })

  it('should throw error when user has no authorised roles', () => {
    const req = createReqWithAuth(true)
    const res = createResWithToken(['SOME_OTHER_ROLES', 'THAT_ARENT_AUTHORISED'])

    expect(async () => {
      try {
        await authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)
      } catch (e: unknown) {
        expect(e).toBe('user does not have the required role to access this page')
      }
    })
  })

  it('should return next when user has authorised role', () => {
    const req = createReqWithAuth(true)
    const res = createResWithToken(['SOME_REQUIRED_ROLE'])

    const authorisationResponse = authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(authorisationResponse).toEqual(next())
  })

  it('should return next when there is no authenticated user', () => {
    const req = createReqWithAuth(false)
    const res = createResWithToken()
    const authorisationResponse = authorisationMiddleware()(req, res, next)
    expect(authorisationResponse).toEqual(next())
  })
})
