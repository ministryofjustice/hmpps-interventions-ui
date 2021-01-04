import express, { Router, Express } from 'express'
import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import allRoutes, { Services } from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import * as auth from '../../authentication/auth'
import { user, MockUserService } from './mocks/mockUserService'
import MockCommunityApiService from './mocks/mockCommunityApiService'
import InterventionsService from '../../services/interventionsService'

function appSetup(route: Router, production: boolean): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.use((req, res, next) => {
    req.user = user
    res.locals = {}
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use('/', route)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export default function appWithAllRoutes({
  production = false,
  overrides = {},
}: {
  production?: boolean
  overrides?: Partial<Services>
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(
    allRoutes(standardRouter(new MockUserService()), {
      communityApiService: new MockCommunityApiService(),
      interventionsService: {} as InterventionsService,
      ...overrides,
    }),
    production
  )
}
