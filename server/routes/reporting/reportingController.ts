import { Request, Response } from 'express'
import createError from 'http-errors'
import S3 from 'aws-sdk/clients/s3'
import ReportingPresenter from './performanceReport/reportingPresenter'
import ReportingView from './performanceReport/reportingView'
import ControllerUtils from '../../utils/controllerUtils'
import { FormValidationError } from '../../utils/formValidationError'
import ReportingForm from './performanceReport/reportingForm'
import PerformanceReportConfirmationView from './performanceReport/confirmation/performanceReportConfirmationView'
import config from '../../config'
import InterventionsService from '../../services/interventionsService'

export default class ReportingController {
  s3Service: S3

  constructor(private readonly interventionsService: InterventionsService) {
    this.s3Service = new S3(config.s3.service)
  }

  async viewReporting(_req: Request, res: Response): Promise<void> {
    const presenter = new ReportingPresenter(res.locals.user)
    const view = new ReportingView(presenter)
    ControllerUtils.renderWithLayout(res, view, null)
  }

  async createReport(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token

    let userInputData: Record<string, unknown> | null = null
    let formError: FormValidationError | null = null

    const data = await new ReportingForm(req).data()

    if (data.error) {
      res.status(400)
      formError = data.error
      userInputData = req.body
      const presenter = new ReportingPresenter(res.locals.user, formError, userInputData)
      const view = new ReportingView(presenter)
      ControllerUtils.renderWithLayout(res, view, null)
    } else {
      await this.interventionsService.generateServiceProviderPerformanceReport(accessToken, data.value)
      res.redirect('/service-provider/performance-report/confirmation')
    }
  }

  async showPerformanceReportConfirmation(_req: Request, res: Response): Promise<void> {
    const view = new PerformanceReportConfirmationView()
    ControllerUtils.renderWithLayout(res, view, null)
  }

  async downloadPerformanceReport(req: Request, res: Response): Promise<void> {
    const { filename } = req.query
    if (!filename) {
      throw createError(400, "required query parameter 'filename' missing")
    }

    const downloadUrl = this.s3Service.getSignedUrl('getObject', {
      Bucket: config.s3.bucket.name,
      Key: `reports/service-provider/performance/${filename}`,
      Expires: 60 * 15, // 15 minutes - the page can load without the download starting
    })

    ControllerUtils.renderWithLayout(
      res,
      { renderArgs: ['reporting/performanceReport/performanceReportDownload', { downloadUrl, filename }] },
      null
    )
  }
}
