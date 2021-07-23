import Wiremock from './wiremock'

export default class InterventionsServiceMocks {
  constructor(private readonly wiremock: Wiremock, private readonly mockPrefix: string) {}

  stubGetDraftReferral = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/draft-referral/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubCreateDraftReferral = async (responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/draft-referral`,
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          Location: `http://localhost:8092${this.mockPrefix}/draft-referral/${responseJson.id}`,
        },
        jsonBody: responseJson,
      },
    })
  }

  stubPatchDraftReferral = async (id: string, responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `${this.mockPrefix}/draft-referral/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubSetDesiredOutcomesForServiceCategory = async (
    referralId: string,
    responseJson: Record<string, unknown>
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `${this.mockPrefix}/draft-referral/${referralId}/desired-outcomes`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubSetComplexityLevelForServiceCategory = async (
    referralId: string,
    responseJson: Record<string, unknown>
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `${this.mockPrefix}/draft-referral/${referralId}/complexity-level`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetServiceCategory = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/service-category/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetDraftReferralsForUserToken = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPath: `${this.mockPrefix}/draft-referrals`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubSendDraftReferral = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/draft-referral/${id}/send`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetSentReferral = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/sent-referral/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetSentReferralsForUserToken = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `${this.mockPrefix}/sent-referrals`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetServiceProviderSentReferralsSummaryForUserToken = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `${this.mockPrefix}/sent-referrals/summary/service-provider`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubAssignSentReferral = async (id: string, responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/sent-referral/${id}/assign`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetInterventions = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        // We don’t care about the query (filter)
        urlPath: `${this.mockPrefix}/interventions`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetIntervention = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/intervention/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetPccRegions = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/pcc-regions`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubCreateDraftActionPlan = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/draft-action-plan`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubUpdateDraftActionPlan = async (id: string, responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `${this.mockPrefix}/draft-action-plan/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubSubmitActionPlan = async (id: string, responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/draft-action-plan/${id}/submit`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetActionPlan = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/action-plan/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubRecordActionPlanAppointmentAttendance = async (
    actionPlanId: string,
    sessionNumber: string,
    responseJson: unknown
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/action-plan/${actionPlanId}/appointment/${sessionNumber}/record-attendance`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubRecordActionPlanAppointmentBehavior = async (
    actionPlanId: string,
    sessionNumber: string,
    responseJson: unknown
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/action-plan/${actionPlanId}/appointment/${sessionNumber}/record-behaviour`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetActionPlanAppointments = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/action-plan/${id}/appointments`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetActionPlanAppointment = async (id: string, session: number, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/action-plan/${id}/appointments/${session}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubUpdateActionPlanAppointment = async (id: string, session: number, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `${this.mockPrefix}/action-plan/${id}/appointment/${session}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubSubmitActionPlanSessionFeedback = async (
    actionPlanId: string,
    session: number,
    responseJson: unknown
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/action-plan/${actionPlanId}/appointment/${session}/submit`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubCreateDraftEndOfServiceReport = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/draft-end-of-service-report`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubUpdateDraftEndOfServiceReport = async (id: string, responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `${this.mockPrefix}/draft-end-of-service-report/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubSubmitEndOfServiceReport = async (id: string, responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/draft-end-of-service-report/${id}/submit`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetEndOfServiceReport = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/end-of-service-report/${id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubEndReferral = async (referralId: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/sent-referral/${referralId}/end`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetReferralCancellationReasons = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/referral-cancellation-reasons`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubRecordSupplierAssessmentAppointmentAttendance = async (
    referralId: string,
    responseJson: unknown
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${this.mockPrefix}/referral/${referralId}/supplier-assessment/record-attendance`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubRecordSupplierAssessmentAppointmentBehaviour = async (
    referralId: string,
    responseJson: unknown
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${this.mockPrefix}/referral/${referralId}/supplier-assessment/record-behaviour`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetSupplierAssessment = async (referralId: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/sent-referral/${referralId}/supplier-assessment`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubScheduleSupplierAssessmentAppointment = async (
    supplierAssessmentId: string,
    responseJson: unknown
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${this.mockPrefix}/supplier-assessment/${supplierAssessmentId}/schedule-appointment`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubSubmitSupplierAssessmentAppointmentFeedback = async (
    referralId: string,
    responseJson: unknown
  ): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/referral/${referralId}/supplier-assessment/submit-feedback`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }
}
