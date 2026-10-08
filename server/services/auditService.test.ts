import AuditService, { AuditAction, AuditOutcome, AuditSubjectType } from './auditService'
import HmppsAuditClient from '../data/hmppsAuditClient'

jest.mock('../data/hmppsAuditClient')

describe('Audit service', () => {
  let hmppsAuditClient: jest.Mocked<HmppsAuditClient>
  let auditService: AuditService
  const auditClientConfig = {
    queueUrl: 'http://localhost:4566/000000000000/mainQueue',
    region: 'eu-west-2',
    serviceName: 'hmpps-service',
    enabled: true,
  }

  beforeEach(() => {
    hmppsAuditClient = new HmppsAuditClient(auditClientConfig) as jest.Mocked<HmppsAuditClient>
    auditService = new AuditService(hmppsAuditClient)
  })

  describe('logAuditEvent', () => {
    it('sends audit message using audit client', async () => {
      await auditService.logAuditEvent({
        what: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith({
        what: 'AUDIT_EVENT',
        who: 'user1',
        subjectId: 'subject123',
        subjectType: 'exampleType',
        correlationId: 'request123',
        details: { extraDetails: 'example' },
      })
    })
  })

  describe('logInteraction', () => {
    it('sends an <ACTION>_<ENTITY>_<OUTCOME> event without throwing on send errors', async () => {
      await auditService.logInteraction(AuditAction.VIEW, 'REFERRAL_DETAILS', AuditOutcome.SUCCESS, {
        who: 'user1',
        subjectId: 'X123456',
        subjectType: AuditSubjectType.CRN,
        correlationId: 'request123',
        details: { entityIds: { id: 'referral-1' } },
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith(
        {
          what: 'VIEW_REFERRAL_DETAILS_SUCCESS',
          who: 'user1',
          subjectId: 'X123456',
          subjectType: 'CRN',
          correlationId: 'request123',
          details: { entityIds: { id: 'referral-1' } },
        },
        false
      )
    })
  })

  describe('logSearchServiceUser', () => {
    it('sends a SEARCH_SERVICE_USER event with the given outcome', async () => {
      await auditService.logSearchServiceUser(AuditOutcome.ATTEMPT, {
        who: 'user1',
        subjectId: 'X123456',
        subjectType: AuditSubjectType.SEARCH_TERM,
      })

      expect(hmppsAuditClient.sendMessage).toHaveBeenCalledWith(
        { what: 'SEARCH_SERVICE_USER_ATTEMPT', who: 'user1', subjectId: 'X123456', subjectType: 'SEARCH_TERM' },
        false
      )
    })
  })
})
