import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CommunityApiService from '../services/communityApiService'
import IntegrationSamplesRoutes from './integrationSamples'

interface RouteProvider {
  [key: string]: RequestHandler
}

export default function routes(router: Router, communityApiService: CommunityApiService): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const integrationSamples: RouteProvider = IntegrationSamplesRoutes(communityApiService)

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/integrations/delius/user', integrationSamples.viewDeliusUserSample)

  return router
}
