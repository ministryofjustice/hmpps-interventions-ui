import Wiremock from './wiremock'

export default class InterventionsServiceMocks {
  constructor(private readonly wiremock: Wiremock) {}

  stubGetDraftReferral = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `/interventions/draft-referral/${id}`,
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
        urlPattern: '/interventions/draft-referral',
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          Location: `http://localhost:8092/interventions/draft-referral/${responseJson.id}`,
        },
        jsonBody: responseJson,
      },
    })
  }

  stubPatchDraftReferral = async (id: string, responseJson: Record<string, unknown>): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PATCH',
        urlPattern: `/interventions/draft-referral/${id}`,
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
        urlPattern: `/interventions/service-category/${id}`,
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
        urlPath: '/interventions/draft-referrals',
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

  stubGetServiceProvider = async (id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `/interventions/service-provider/${id}`,
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
        urlPattern: `/interventions/draft-referral/${id}/send`,
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
        urlPattern: `/interventions/sent-referral/${id}`,
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
        urlPattern: `/interventions/sent-referrals`,
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
