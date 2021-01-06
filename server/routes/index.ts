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
  get('/referrals/:id/further-information', (req, res) => referralsController.viewFurtherInformation(req, res))
  post('/referrals/:id/further-information', (req, res) => referralsController.updateFurtherInformation(req, res))
  get('/referrals/:id/desired-outcomes', (req, res) => referralsController.viewDesiredOutcomes(req, res))
  post('/referrals/:id/desired-outcomes', (req, res) => referralsController.updateDesiredOutcomes(req, res))
  get('/referrals/:id/needs-and-requirements', (req, res) => referralsController.viewNeedsAndRequirements(req, res))
  post('/referrals/:id/needs-and-requirements', (req, res) => referralsController.updateNeedsAndRequirements(req, res))
  get('/referrals/:id/risk-information', (req, res) => referralsController.viewRiskInformation(req, res))
  post('/referrals/:id/risk-information', (req, res) => referralsController.updateRiskInformation(req, res))
  get('/referrals/:id/rar-days', (req, res) => referralsController.viewRarDays(req, res))
  post('/referrals/:id/rar-days', (req, res) => referralsController.updateRarDays(req, res))

  return router
}
