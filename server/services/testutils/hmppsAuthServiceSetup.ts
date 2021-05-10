import HmppsAuthService from '../hmppsAuthService'

const MockedHmppsAuthService = <jest.Mock<HmppsAuthService>>HmppsAuthService

// fixme: this is a rubbish way to do this. the service should take a RedisClient in its constructor
//        which can be mocked out when needed.
jest.mock('../../services/hmppsAuthService')
jest.mock('redis', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  })),
}))

export default MockedHmppsAuthService
