import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export enum Page {
  EXAMPLE_PAGE = 'EXAMPLE_PAGE',
}

enum AuditableUserAction {
  SEARCH_SERVICE_USER_BY_CRN = 'SEARCH_SERVICE_USER_BY_CRN',
}

export interface PageViewEventDetails {
  who: string
  subjectId?: string
  subjectType?: string
  correlationId?: string
  details?: object
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  async logSearchServiceUser(baseAuditData: PageViewEventDetails) {
    await this.logAuditEvent({ ...baseAuditData, what: AuditableUserAction.SEARCH_SERVICE_USER_BY_CRN })
  }

  async logPageView(page: Page, eventDetails: PageViewEventDetails) {
    const event: AuditEvent = {
      ...eventDetails,
      what: `PAGE_VIEW_${page}`,
    }
    await this.hmppsAuditClient.sendMessage(event)
  }
}
