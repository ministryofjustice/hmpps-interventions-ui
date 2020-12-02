import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CommunityApiService from '../services/communityApiService'
import InterventionsService from '../services/interventionsService'
import IntegrationSamplesRoutes from './integrationSamples'

interface RouteProvider {
  [key: string]: RequestHandler
}

export interface Services {
  communityApiService: CommunityApiService
  interventionsService: InterventionsService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const integrationSamples: RouteProvider = IntegrationSamplesRoutes(services.communityApiService)

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/integrations/delius/user', integrationSamples.viewDeliusUserSample)

  return router
}
