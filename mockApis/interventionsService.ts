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

  stubGetDraftReferralsForUser = async (responseJson: unknown): Promise<unknown> => {
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

  stubGetSentReferrals = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/sent-referrals`,
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

  stubRecordAppointmentAttendance = async (
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

  stubRecordAppointmentBehaviour = async (
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

  stubSubmitSessionFeedback = async (
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
}
