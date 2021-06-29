import { Factory } from 'fishery'
import { ServiceProviderReportReferral } from '../../server/models/serviceProviderReportReferral'

export default Factory.define<ServiceProviderReportReferral>(() => ({
  referralLink: 'https://refer-and-monitor.com/referral/c9f9e22f-ddd9-422a-a9af-76fc02b18b38',
  referralRef: 'SM1973AC',
  referralId: 'c9f9e22f-ddd9-422a-a9af-76fc02b18b38',
  contractId: 'thing',
  organisationId: 'XYZ5678',
  referringOfficerEmail: 'joe.probation@example.com',
  caseworkerId: 'liane.supplier@example.com',
  serviceUserCRN: 'X017844',
  dateReferralReceived: '2021-06-27T14:49:01+01:00',
  dateSAABooked: '2021-06-27T14:49:01+01:00',
  dateSAAAttended: '2021-06-27T14:49:01+01:00',
  dateFirstActionPlanSubmitted: '2021-06-27T14:49:01+01:00',
  dateOfFirstActionPlanApproval: '2021-06-27T14:49:01+01:00',
  dateOfFirstAttendedSession: '2021-06-27T14:49:01+01:00',
  outcomesToBeAchievedCount: 8,
  outcomesAchieved: 5.5,
  countOfSessionsExpected: 10,
  countOfSessionsAttended: 6,
  endRequestedByPPAt: '2021-06-27T14:49:01+01:00',
  endRequestedByPPReason: 'REC',
  dateEOSRSubmitted: '2021-06-27T14:49:01+01:00',
  concludedAt: '2021-06-27T14:49:01+01:00',
}))
