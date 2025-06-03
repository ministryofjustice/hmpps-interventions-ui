import { createClient, RedisClientType } from 'redis'
import DraftsService from './draftsService'

let mockedUuid: string
jest.mock('uuid', () => {
  return {
    v4: () => mockedUuid,
  }
})

const redis = {
  get: jest.fn().mockResolvedValue(true),
  set: jest.fn().mockImplementation((_key, _value, _options) => Promise.resolve(true)),
} as unknown as jest.Mocked<Pick<RedisClientType, 'get' | 'set'>>

const expiry = { seconds: 24 * 60 * 60 }

describe(DraftsService, () => {
  const clock = { now: () => new Date('2021-04-01T10:25:00Z') }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('.createDraft', () => {
    it('generates a random UUID and stores the data in Redis under a key derived from that UUID, with the given expiry time', async () => {
      mockedUuid = '2dc7ef56-58dd-4339-9924-c33318738068'

      redis.set.mockImplementationOnce((_key, _value, _options) => Promise.resolve('OK'))

      const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

      const draft = await draftsService.createDraft('someExampleType', { a: 1, b: 2 }, { userId: 'someUserId' })

      expect(draft).toEqual({
        id: '2dc7ef56-58dd-4339-9924-c33318738068',
        type: 'someExampleType',
        createdAt: new Date('2021-04-01T10:25:00Z'),
        createdBy: { id: 'someUserId' },
        updatedAt: new Date('2021-04-01T10:25:00Z'),
        softDeleted: false,
        data: { a: 1, b: 2 },
      })

      expect(redis.set).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything(), {
        EX: expiry.seconds,
      })

      const valueArg = redis.set.mock.calls[0][1]

      let parsed: unknown

      if (typeof valueArg === 'string') {
        parsed = JSON.parse(valueArg)
      } else {
        // fallback if it's not a string
        parsed = valueArg
      }

      expect(parsed).toEqual({
        version: 2,
        id: '2dc7ef56-58dd-4339-9924-c33318738068',
        type: 'someExampleType',
        createdAt: '2021-04-01T10:25:00.000Z',
        createdBy: { id: 'someUserId' },
        updatedAt: '2021-04-01T10:25:00.000Z',
        softDeleted: false,
        data: { a: 1, b: 2 },
      })
    })
  })

  describe('.fetchDraft', () => {
    describe('when Redis contains a draft for that ID, created by the specified user', () => {
      it('returns that draft', async () => {
        const dto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-04-01T10:25:00Z',
          data: { a: 1, b: 2 },
        }
        const data = JSON.stringify(dto)

        redis.get.mockImplementationOnce(_key => Promise.resolve(data))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        const draft = await draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })

        expect(draft).toEqual({
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: new Date('2021-04-01T10:25:00Z'),
          createdBy: { id: 'someUserId' },
          updatedAt: new Date('2021-04-01T10:25:00Z'),
          softDeleted: false,
          data: { a: 1, b: 2 },
        })

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068')
      })
    })

    describe('when Redis contains a draft for that ID, created by a different user', () => {
      it('throws an error', async () => {
        const dto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00Z',
          createdBy: { id: 'someOtherUserId' },
          updatedAt: '2021-04-01T10:25:00Z',
          data: { a: 1, b: 2 },
        }
        const data = JSON.stringify(dto)

        redis.get.mockImplementationOnce(_key => Promise.resolve(data))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        await expect(
          draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068')
      })
    })

    describe('when Redis doesn’t contain a draft for that ID', () => {
      it('returns null', async () => {
        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        redis.get.mockImplementation(_key => Promise.resolve(null))

        expect(
          await draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).toBeNull()

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068')
      })
    })

    describe('handling of DTO versions', () => {
      describe('when the object in Redis does not have a version field', () => {
        it('returns a draft with softDeleted: false', async () => {
          const dto = {
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-04-01T10:25:00Z',
            createdBy: { id: 'someUserId' },
            updatedAt: '2021-04-01T10:25:00Z',
            data: { a: 1, b: 2 },
          }
          const data = JSON.stringify(dto)

          redis.get.mockImplementationOnce(_key => Promise.resolve(data))

          const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

          const draft = await draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })

          expect(draft).toEqual({
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: new Date('2021-04-01T10:25:00Z'),
            createdBy: { id: 'someUserId' },
            updatedAt: new Date('2021-04-01T10:25:00Z'),
            softDeleted: false,
            data: { a: 1, b: 2 },
          })
        })
      })

      describe('when the object in Redis has a version field with value >= 2', () => {
        it('returns a draft whose softDeleted property comes from the object in Redis', async () => {
          const dto = {
            version: 2,
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-04-01T10:25:00Z',
            createdBy: { id: 'someUserId' },
            updatedAt: '2021-04-01T10:25:00Z',
            softDeleted: true,
            data: { a: 1, b: 2 },
          }
          const data = JSON.stringify(dto)

          redis.get.mockImplementationOnce(_key => Promise.resolve(data))

          const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

          const draft = await draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })

          expect(draft).toEqual({
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: new Date('2021-04-01T10:25:00Z'),
            createdBy: { id: 'someUserId' },
            updatedAt: new Date('2021-04-01T10:25:00Z'),
            softDeleted: true,
            data: { a: 1, b: 2 },
          })
        })
      })
    })
  })

  describe('.updateDraft', () => {
    describe('when Redis contains a draft for that ID, created by the specified user', () => {
      it('updates that draft in Redis and bumps the updatedAt property', async () => {
        const initialDto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-03-10T11:50:00Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-03-10T11:50:00Z',
          data: { a: 1, b: 2 },
        }
        const initialData = JSON.stringify(initialDto)

        redis.get.mockImplementationOnce(_key => Promise.resolve(initialData))

        redis.set.mockImplementationOnce((_key, _value, _options) => Promise.resolve('Ok'))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        await draftsService.updateDraft(
          '2dc7ef56-58dd-4339-9924-c33318738068',
          { c: 3, d: 4 },
          { userId: 'someUserId' }
        )

        expect(redis.set).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything(), {
          EX: expiry.seconds,
        })

        const valueArg = redis.set.mock.calls[0][1]

        let parsed: unknown

        if (typeof valueArg === 'string') {
          parsed = JSON.parse(valueArg)
        } else {
          // fallback if it's not a string
          parsed = valueArg
        }

        expect(parsed).toEqual({
          version: 2,
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-03-10T11:50:00.000Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-04-01T10:25:00.000Z',
          softDeleted: false,
          data: { c: 3, d: 4 },
        })
      })
    })

    describe('when Redis contains a draft for that ID, created by a different user', () => {
      it('throws an error and does not update the draft', async () => {
        const initialDto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-03-10T11:50:00Z',
          createdBy: { id: 'someOtherUserId' },
          updatedAt: '2021-03-10T11:50:00Z',
          data: { a: 1, b: 2 },
        }
        const initialData = JSON.stringify(initialDto)

        redis.get.mockImplementationOnce(_key => Promise.resolve(initialData))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        await expect(
          draftsService.updateDraft('2dc7ef56-58dd-4339-9924-c33318738068', { c: 3, d: 4 }, { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.set).not.toHaveBeenCalled()
      })
    })

    describe('when Redis doesn’t contain a draft for that ID', () => {
      it('throws an error', async () => {
        redis.get.mockImplementationOnce(_key => Promise.resolve(null))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        await expect(
          draftsService.updateDraft('2dc7ef56-58dd-4339-9924-c33318738068', { c: 3, d: 4 }, { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068')

        expect(redis.set).not.toHaveBeenCalled()
      })
    })
  })

  describe('.deleteDraft', () => {
    describe('when Redis contains a draft for that ID, created by the specified user', () => {
      it('updates the draft in Redis, setting its softDeleted property to true, with the given expiry time', async () => {
        const dto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-04-01T10:25:00Z',
          data: { a: 1, b: 2 },
        }
        const data = JSON.stringify(dto)

        redis.get.mockImplementationOnce(_key => Promise.resolve(data))

        redis.set.mockImplementationOnce((_key, _value, _options) => Promise.resolve('OK'))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        await draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })

        expect(redis.set).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything(), {
          EX: expiry.seconds,
        })

        const valueArg = redis.set.mock.calls[0][1]
        let parsed: unknown

        if (typeof valueArg === 'string') {
          parsed = JSON.parse(valueArg)
        } else {
          // fallback if it's not a string
          parsed = valueArg
        }

        expect(parsed).toEqual({
          version: 2,
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00.000Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-04-01T10:25:00.000Z',
          softDeleted: true,
          data: { a: 1, b: 2 },
        })
      })
    })

    describe('when Redis contains a draft for that ID, created by a different user', () => {
      it('throws an error and does not update that draft', async () => {
        const dto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00Z',
          createdBy: { id: 'someOtherUserId' },
          updatedAt: '2021-04-01T10:25:00Z',
          data: { a: 1, b: 2 },
        }
        const data = JSON.stringify(dto)

        redis.get.mockImplementationOnce(_key => Promise.resolve(data))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        await expect(
          draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.set).not.toHaveBeenCalled()
      })
    })

    describe('when Redis doesn’t contain a draft for that ID, as indicated by the Redis GET command', () => {
      it('throws an error', async () => {
        redis.get.mockImplementationOnce(_key => Promise.resolve(null))

        const draftsService = new DraftsService(redis as unknown as ReturnType<typeof createClient>, expiry, clock)

        await expect(
          draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.set).not.toHaveBeenCalled()
      })
    })
  })
})
