import superagent, { Response } from 'superagent'

export default class Wiremock {
  constructor(private readonly adminUrl: string) {}

  async stubFor(mapping: Record<string, unknown>): Promise<unknown> {
    return superagent.post(`${this.adminUrl}/mappings`).send(mapping)
  }

  async getRequests(): Promise<Response> {
    return superagent.get(`${this.adminUrl}/requests`)
  }

  async resetStubs(): Promise<unknown> {
    const mappingsResponse = await superagent.get(`${this.adminUrl}/mappings`)
    const body = mappingsResponse.body as { mappings: { id: string; response?: { proxyBaseUrl?: string } }[] }

    const nonProxyMappings = body.mappings.filter(mapping => !mapping?.response?.proxyBaseUrl)

    return Promise.all([
      Promise.all(nonProxyMappings.map(mapping => superagent.delete(`${this.adminUrl}/mappings/${mapping.id}`))),
      superagent.delete(`${this.adminUrl}/requests`),
    ])
  }
}
