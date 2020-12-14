import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CommunityApiService from '../services/communityApiService'
import InterventionsService from '../services/interventionsService'
import IntegrationSamplesRoutes from './integrationSamples'
import ReferralsController from './referrals/referralsController'

interface RouteProvider {
  [key: string]: RequestHandler
}

export interface Services {
  communityApiService: CommunityApiService
  interventionsService: InterventionsService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const integrationSamples: RouteProvider = IntegrationSamplesRoutes(services.communityApiService)
  const referralsController = new ReferralsController(services.interventionsService)

  get('/', (req, res, next) => {
    res.render('pages/index')
  })

  get('/integrations/delius/user', integrationSamples.viewDeliusUserSample)

  get('/referrals/start', (req, res) => referralsController.startReferral(req, res))
  post('/referrals', (req, res) => referralsController.createReferral(req, res))
  get('/referrals/:id/form', (req, res) => referralsController.viewReferralForm(req, res))
  get('/referrals/:id/complexity-level', (req, res) => referralsController.viewComplexityLevel(req, res))
  post('/referrals/:id/complexity-level', (req, res) => referralsController.updateComplexityLevel(req, res))
  get('/referrals/:id/completion-deadline', (req, res) => referralsController.viewCompletionDeadline(req, res))
  post('/referrals/:id/completion-deadline', (req, res) => referralsController.updateCompletionDeadline(req, res))

  return router
}
