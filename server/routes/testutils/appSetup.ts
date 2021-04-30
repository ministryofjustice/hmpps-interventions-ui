import express, { Router, Express } from 'express'
import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import allRoutes, { Services } from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import MockCommunityApiService from './mocks/mockCommunityApiService'
import InterventionsService from '../../services/interventionsService'
import MockOffenderAssessmentsApiService from './mocks/mockOffenderAssessmentsApiService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import LoggedInUserFactory from '../../../testutils/factories/loggedInUser'

export enum AppSetupUserType {
  probationPractitioner = 'delius',
  serviceProvider = 'auth',
}

function appSetup(route: Router, production: boolean, userType: AppSetupUserType): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  const user = LoggedInUserFactory.build()
  user.authSource = userType
  if (userType === AppSetupUserType.serviceProvider) {
    user.organizations = [{ id: 'HARMONY_LIVING', name: 'Harmony Living' }]
  }

  app.use((req, res, next) => {
    req.user = user
    req.isAuthenticated = () => {
      return true
    }
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
  userType,
}: {
  production?: boolean
  overrides?: Partial<Services>
  userType: AppSetupUserType
}): Express {
  // auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(
    allRoutes(standardRouter(), {
      communityApiService: new MockCommunityApiService(),
      offenderAssessmentsApiService: new MockOffenderAssessmentsApiService(),
      interventionsService: {} as InterventionsService,
      hmppsAuthService: new MockedHmppsAuthService(),
      ...overrides,
    }),
    production,
    userType
  )
}
