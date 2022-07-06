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
    return superagent.post(`${this.adminUrl}/reset`)
  }
}
