import { defaultClient } from 'applicationinsights'
import { addUserDetailsProcessor } from './azureAppInsights'

jest.mock('applicationinsights', () => ({
  defaultClient: { context: { keys: { userAuthUserId: 'ai.user.authUserId' } } },
}))

describe('addUserDetailsProcessor', () => {
  const requestEnvelope = () => ({
    data: { baseType: 'RequestData', baseData: { properties: { existing: 'value' } } },
    tags: { other: 'tag' },
  })

  it('adds the user id tag and user uuid property to request telemetry', () => {
    const envelope = requestEnvelope()
    const request = { user: { userId: '123', userUuid: 'a1b2c3d4-0000-0000-0000-000000000000' } }

    expect(addUserDetailsProcessor(envelope, { 'http.ServerRequest': request })).toBe(true)

    expect(envelope.tags).toEqual({ other: 'tag', [defaultClient.context.keys.userAuthUserId]: '123' })
    expect(envelope.data.baseData.properties).toEqual({
      existing: 'value',
      userUuid: 'a1b2c3d4-0000-0000-0000-000000000000',
    })
  })

  it('does not add a user uuid property when the user has no uuid', () => {
    const envelope = requestEnvelope()

    addUserDetailsProcessor(envelope, { 'http.ServerRequest': { user: { userId: '123' } } })

    expect(envelope.data.baseData.properties).toEqual({ existing: 'value' })
  })

  it('leaves non-request telemetry unchanged', () => {
    const envelope = { data: { baseType: 'DependencyData', baseData: {} }, tags: {} }

    addUserDetailsProcessor(envelope, { 'http.ServerRequest': { user: { userId: '123', userUuid: 'uuid' } } })

    expect(envelope).toEqual({ data: { baseType: 'DependencyData', baseData: {} }, tags: {} })
  })
})
