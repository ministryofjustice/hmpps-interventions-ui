import HmppsAuthService from '../hmppsAuthService'

const MockedHmppsAuthService = <jest.Mock<HmppsAuthService>>HmppsAuthService

// fixme: this is a rubbish way to do this. the service should take a RedisClient in its constructor
//        which can be mocked out when needed.
jest.mock('../../services/hmppsAuthService')
jest.mock('redis', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue('connected'),
    on: jest.fn(),
    get: jest.fn().mockResolvedValue(true),
    set: jest.fn().mockImplementation((_key, _value, _options) => Promise.resolve(true)),
  })),
}))

export default MockedHmppsAuthService
