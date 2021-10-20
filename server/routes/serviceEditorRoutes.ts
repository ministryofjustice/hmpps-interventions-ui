import { Router } from 'express'
import { Services, get } from './index'
import ServiceEditorController from './serviceEditor/serviceEditorController'

export const serviceEditorUrlPrefix = '/service-editor'

export default function serviceEditorRoutes(router: Router, services: Services): Router {
  const serviceEditorController = new ServiceEditorController(services.interventionsService)

  get(router, '/dashboard', (req, res) => serviceEditorController.dashboard(req, res))

  return router
}
