import { Request, Response } from 'express'
import StaticContentIndexPresenter from './indexPresenter'
import StaticContentIndexView from './indexView'

export default class StaticContentController {
  private static pages: { path: string; template: string; description: string }[] = [
    {
      path: '/service-provider/session-progress',
      template: 'serviceProviderReferrals/sessionProgress',
      description: 'IC-1052 (session progress)',
    },
    {
      path: '/service-provider/session-progress-all-sessions-completed',
      template: 'serviceProviderReferrals/sessionProgressAllSessionsCompleted',
      description: 'IC-1078 (session progress - all sessions completed, with notification banner)',
    },
    {
      path: '/service-provider/session-progress-sessions-updated',
      template: 'serviceProviderReferrals/sessionProgressSessionsUpdated',
      description: 'IC-1251 (session progress - session updated notification banner)',
    },
    {
      path: '/service-provider/session-feedback/attendance',
      template: 'serviceProviderReferrals/sessions/feedback/attendance',
      description: 'IC-1094 (session feedback: attendance)',
    },
    {
      path: '/service-provider/session-feedback/attendance-no',
      template: 'serviceProviderReferrals/sessions/feedback/attendanceNo',
      description: 'IC-1094 (session feedback: attendance NO)',
    },
    {
      path: '/service-provider/session-feedback/safeguarding',
      template: 'serviceProviderReferrals/sessions/feedback/safeguarding',
      description: 'IC-1095 (session feedback: safeguarding)',
    },
    {
      path: '/service-provider/session-feedback/any-changes',
      template: 'serviceProviderReferrals/sessions/feedback/anyChanges',
      description: 'IC-1053 (session feedback: any changes)',
    },
    {
      path: '/service-provider/session-feedback/outcomes',
      template: 'serviceProviderReferrals/sessions/feedback/outcomes',
      description: 'IC-1054 (session feedback: outcomes)',
    },
    {
      path: '/service-provider/session-feedback/behaviour',
      template: 'serviceProviderReferrals/sessions/feedback/behaviour',
      description: 'IC-1055 (session feedback: behaviour)',
    },
    {
      path: '/service-provider/session-feedback/information',
      template: 'serviceProviderReferrals/sessions/feedback/information',
      description: 'IC-1056 (session feedback: information)',
    },
    {
      path: '/service-provider/session-feedback/next-session',
      template: 'serviceProviderReferrals/sessions/feedback/nextSession',
      description: 'IC-1057 (session feedback: next session)',
    },
    {
      path: '/service-provider/session-feedback/review',
      template: 'serviceProviderReferrals/sessions/feedback/review',
      description: 'IC-1058 (session feedback: review)',
    },
    {
      path: '/service-provider/session-feedback/review-no',
      template: 'serviceProviderReferrals/sessions/feedback/reviewNo',
      description: 'IC-1058 (session feedback: review NO)',
    },
    {
      path: '/service-provider/session-feedback/show',
      template: 'serviceProviderReferrals/sessions/feedback/show',
      description: 'IC-1083 (view submitted feedback)',
    },
    {
      path: '/service-provider/session/show',
      template: 'serviceProviderReferrals/sessions/show',
      description: 'IC-1087 (session details: edit details)',
    },
    {
      path: '/service-provider/session/amend',
      template: 'serviceProviderReferrals/sessions/amend',
      description: 'IC-1087 (session details: edit details amend)',
    },
    {
      path: '/service-provider/session-feedback/confirmation',
      template: 'serviceProviderReferrals/sessions/feedback/confirmation',
      description: 'IC-1085 (session feedback: confirmation)',
    },
    {
      path: '/service-provider/sessions/feedback/confirmation-all-sessions-completed',
      template: 'serviceProviderReferrals/sessions/feedback/confirmationAllSessionsCompleted',
      description: 'IC-1177 (session feedback: confirmation - all sessions completed)',
    },
    {
      path: '/service-provider/sessions/feedback/confirmation-failure-attend',
      template: 'serviceProviderReferrals/sessions/feedback/confirmationFailureAttend',
      description: 'IC-1177 (session feedback: confirmation - failure to attend)',
    },
    {
      path: '/service-provider/sessions/reschedule-session-details',
      template: 'serviceProviderReferrals/sessions/rescheduleSessionDetails',
      description: 'IC-1177 (session feedback: Reschedule session details)',
    },
    {
      path: '/service-provider/layout-all-components',
      template: 'pages/layoutAllComponents',
      description: 'IC-1159 (layout template for all components)',
    },
    {
      path: '/service-provider/su-banner-state',
      template: 'pages/suBannerState',
      description: 'IC-1235 (Multi-version of the SU banner states)',
    },
  ]

  static get allPaths(): string[] {
    return this.pages.map(page => page.path)
  }

  async index(req: Request, res: Response): Promise<void> {
    const presenter = new StaticContentIndexPresenter(StaticContentController.pages)
    const view = new StaticContentIndexView(presenter)

    res.render(...view.renderArgs)
  }

  async renderStaticPage(req: Request, res: Response): Promise<void> {
    const page = StaticContentController.pages.find(aPage => aPage.path === req.path)

    if (page === undefined) {
      throw new Error(`No static page found for path ${req.path}`)
    }

    res.render(page.template)
  }
}
