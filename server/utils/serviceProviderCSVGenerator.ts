import stringify from 'csv-stringify'
import { ServiceProviderReportReferral } from '../models/serviceProviderReportReferral'
import CalendarDay from './calendarDay'

export default class ServiceProviderCSVGenerator {
  static async generate(reportReferrals: ServiceProviderReportReferral[]): Promise<string> {
    const data: string[] = []
    const stringifier = stringify({
      header: true,
      columns: [
        { key: 'referralLink', header: 'referral_link' },
        { key: 'referralRef', header: 'referral_ref' },
        { key: 'referralId', header: 'referral_id' },
        { key: 'contractId', header: 'contract_id' },
        { key: 'organisationId', header: 'organisation_id' },
        { key: 'referringOfficerEmail', header: 'referring_officer_email' },
        { key: 'caseworkerId', header: 'caseworker_id' },
        { key: 'serviceUserCRN', header: 'service_user_crn' },
        { key: 'dateReferralReceived', header: 'date_referral_received' },
        { key: 'dateSAABooked', header: 'date_saa_booked' },
        { key: 'dateSAAAttended', header: 'date_saa_attended' },
        { key: 'dateFirstActionPlanSubmitted', header: 'date_first_action_plan_submitted' },
        { key: 'dateOfFirstActionPlanApproval', header: 'date_of_first_action_plan_approval' },
        { key: 'dateOfFirstAttendedSession', header: 'date_of_first_attended_session' },
        { key: 'outcomesToBeAchievedCount', header: 'outcomes_to_be_achieved_count' },
        { key: 'outcomesAchieved', header: 'outcomes_achieved' },
        { key: 'countOfSessionsExpected', header: 'count_of_sessions_expected' },
        { key: 'countOfSessionsAttended', header: 'count_of_sessions_attended' },
        { key: 'endRequestedByPPAt', header: 'end_requested_by_pp_at' },
        { key: 'endRequestedByPPReason', header: 'end_requested_by_pp_reason' },
        { key: 'dateEOSRSubmitted', header: 'date_eosr_submitted' },
        { key: 'concludedAt', header: 'concluded_at' },
      ],
    })

    stringifier.on('readable', () => {
      let row = stringifier.read()
      while (row) {
        data.push(row)
        row = stringifier.read()
      }
    })

    reportReferrals.forEach(referral => {
      stringifier.write(referral)
    })
    stringifier.end()

    return new Promise((resolve, _) => {
      stringifier.on('finish', () => {
        resolve(data.join(''))
      })
    })
  }

  static createFilename(): string {
    const todayCalendarDay = CalendarDay.britishDayForDate(new Date())
    return `refer-monitor-intervention_report_${todayCalendarDay.iso8601.replace(/-/g, '').replace(/-/g, '')}.csv`
  }
}
