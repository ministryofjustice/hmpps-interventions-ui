import { Request, Response } from 'express'
import tokenVerificationMiddleware from './tokenVerificationMiddleware'

describe('tokenVerificationMiddleware', () => {
  const tokenVerifier = (verified: boolean) => jest.fn(async () => verified)
  const next = jest.fn()
  const redirectCapturingResponseWithToken = (tokenExpired: boolean) => {
    return {
      redirect: (path: string) => {
        return path
      },
      locals: {
        user: {
          token: {
            expiry: tokenExpired
              ? 1617014589 // march 29th 2021, 11:43AM
              : Math.floor(Date.now() / 1000) + 10, // 10 seconds ahead of now
          },
        },
      },
    } as unknown as Response
  }

  const authenticatedRequest = (authenticated: boolean) => {
    return {
      isAuthenticated: () => authenticated,
      session: {},
      logout: jest.fn(),
    } as unknown as Request
  }

  it('should return next when there is no authenticated user', async () => {
    const req = authenticatedRequest(false)
    const res = redirectCapturingResponseWithToken(false)

    const middlewareResponse = await tokenVerificationMiddleware(tokenVerifier(false))(req, res, next)
    expect(middlewareResponse).toEqual(next())
  })

  it('should return next when the token is valid', async () => {
    const req = authenticatedRequest(true)
    const res = redirectCapturingResponseWithToken(false)

    const middlewareResponse = await tokenVerificationMiddleware(tokenVerifier(true))(req, res, next)
    expect(middlewareResponse).toEqual(next())
  })

  it('should redirect to the login page if the token is expired', async () => {
    const req = authenticatedRequest(true)
    const res = redirectCapturingResponseWithToken(true)

    const middlewareResponse = await tokenVerificationMiddleware(tokenVerifier(true))(req, res, next)
    expect(middlewareResponse).toEqual('/login')
  })

  it('should redirect to the login page if the token expiry is invalid', async () => {
    const req = authenticatedRequest(true)
    const res = redirectCapturingResponseWithToken(false)
    res.locals.user.token = 'token'

    const middlewareResponse = await tokenVerificationMiddleware(tokenVerifier(true))(req, res, next)
    expect(middlewareResponse).toEqual('/login')
  })

  it('should redirect to the login page if the token verification fails', async () => {
    const req = authenticatedRequest(true)
    const res = redirectCapturingResponseWithToken(false)

    const middlewareResponse = await tokenVerificationMiddleware(tokenVerifier(false))(req, res, next)
    expect(middlewareResponse).toEqual('/login')
  })
})
