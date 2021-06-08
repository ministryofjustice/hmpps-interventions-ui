import { Request, Response } from 'express'
import loginRedirectMiddleware from './loginRedirectMiddleware'

describe('loginRedirectMiddleware', () => {
  const next = jest.fn()
  const redirectCapturingResponse = () => {
    return {
      redirect: (path: string) => {
        return path
      },
    } as unknown as Response
  }

  const authenticatedRequest = (authenticated: boolean) => {
    return {
      isAuthenticated: () => authenticated,
      session: {},
    } as unknown as Request
  }

  it('should return next when the user is already logged in', () => {
    const req = authenticatedRequest(true)
    const res = redirectCapturingResponse()
    expect(loginRedirectMiddleware()(req, res, next)).toEqual(next())
  })

  it('should redirect to the login page if the user is not logged in', () => {
    const req = authenticatedRequest(false)
    const res = redirectCapturingResponse()
    expect(loginRedirectMiddleware()(req, res, next)).toEqual('/login')
  })
})
