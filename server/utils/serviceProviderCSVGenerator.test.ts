import serviceProviderReportReferralFactory from '../../testutils/factories/serviceProviderReportReferral'
import ServiceProviderCSVGenerator from './serviceProviderCSVGenerator'

describe(ServiceProviderCSVGenerator, () => {
  describe('.generate', () => {
    describe('with valid ServiceProviderReportReferrals', () => {
      it('returns a CSV-formatted string', async () => {
        const reportReferral = serviceProviderReportReferralFactory.build({
          referralLink: 'https://refer-and-monitor.com/referral/c9f9e22f-ddd9-422a-a9af-76fc02b18b38',
          referralRef: 'SM1973AC',
          referralId: 'c9f9e22f-ddd9-422a-a9af-76fc02b18b38',
          contractId: 'thing',
          organisationId: 'XYZ5678',
          referringOfficerEmail: 'bernard.beaks@example.com',
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
        })

        const reportingResponse = [
          reportReferral,
          serviceProviderReportReferralFactory.build({ referralId: '2144ed62-aa16-468c-ae8d-41588606750e' }),
          serviceProviderReportReferralFactory.build({ referralId: 'd8cc2ad2-a29f-4168-ab84-6d3e130e234b' }),
        ]

        const csv = await ServiceProviderCSVGenerator.generate(reportingResponse)

        expect(csv).toContain(
          'referral_link,referral_ref,referral_id,contract_id,organisation_id,referring_officer_email,caseworker_id,service_user_crn,date_referral_received,date_saa_booked,date_saa_attended,date_first_action_plan_submitted,date_of_first_action_plan_approval,date_of_first_attended_session,outcomes_to_be_achieved_count,outcomes_achieved,count_of_sessions_expected,count_of_sessions_attended,end_requested_by_pp_at,end_requested_by_pp_reason,date_eosr_submitted,concluded_at'
        )
        expect(csv).toContain(
          'https://refer-and-monitor.com/referral/c9f9e22f-ddd9-422a-a9af-76fc02b18b38,SM1973AC,c9f9e22f-ddd9-422a-a9af-76fc02b18b38,thing,XYZ5678,bernard.beaks@example.com,liane.supplier@example.com,X017844,2021-06-27T14:49:01+01:00,2021-06-27T14:49:01+01:00,2021-06-27T14:49:01+01:00,2021-06-27T14:49:01+01:00,2021-06-27T14:49:01+01:00,2021-06-27T14:49:01+01:00,8,5.5,10,6,2021-06-27T14:49:01+01:00,REC,2021-06-27T14:49:01+01:00,2021-06-27T14:49:01+01:00'
        )
        expect(csv).toContain('2144ed62-aa16-468c-ae8d-41588606750e')
        expect(csv).toContain('d8cc2ad2-a29f-4168-ab84-6d3e130e234b')
      })

      describe('with a large number of reporting referrals', () => {
        it('includes all of the input referrals in the CSV', async () => {
          const ids = Array.from({ length: 2000 }, (_, i) => i).map(number => `id-${number}`)
          const reportingResponse = ids.map(id => serviceProviderReportReferralFactory.build({ referralId: id }))

          const csv = await ServiceProviderCSVGenerator.generate(reportingResponse)

          ids.forEach(id => expect(csv).toContain(id))
        })
      })

      describe('when a nullable property is null', () => {
        it('enters an empty string for that cell', async () => {
          const reportReferral = serviceProviderReportReferralFactory.build({
            referralLink: 'https://refer-and-monitor.com/referral/c9f9e22f-ddd9-422a-a9af-76fc02b18b38',
            referralRef: 'SM1973AC',
            referralId: 'c9f9e22f-ddd9-422a-a9af-76fc02b18b38',
            contractId: 'thing',
            organisationId: 'XYZ5678',
            caseworkerId: 'liane.supplier@example.com',
            serviceUserCRN: 'X017844',
            dateReferralReceived: '2021-06-27T14:49:01+01:00',
            dateSAABooked: null,
            dateSAAAttended: null,
            dateFirstActionPlanSubmitted: null,
            dateOfFirstActionPlanApproval: null,
            dateOfFirstAttendedSession: null,
            outcomesToBeAchievedCount: null,
            outcomesAchieved: null,
            countOfSessionsExpected: null,
            countOfSessionsAttended: null,
            endRequestedByPPAt: null,
            endRequestedByPPReason: null,
            dateEOSRSubmitted: null,
            concludedAt: null,
          })

          const csv = await ServiceProviderCSVGenerator.generate([reportReferral])

          expect(csv).toContain(
            'https://refer-and-monitor.com/referral/c9f9e22f-ddd9-422a-a9af-76fc02b18b38,SM1973AC,c9f9e22f-ddd9-422a-a9af-76fc02b18b38,thing,XYZ5678,joe.probation@example.com,liane.supplier@example.com,X017844,2021-06-27T14:49:01+01:00,,,,,,,,,,,,,'
          )
        })
      })
    })
  })

  describe('.createFilename', () => {
    it('returns a filename including the date (in British time zone) the report is generated', () => {
      const mockDate = new Date('2021-06-28T10:00:00Z')
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string)

      expect(ServiceProviderCSVGenerator.createFilename()).toEqual('refer-monitor-intervention_report_20210628.csv')
      spy.mockRestore()
    })
  })
})
