import { Callback, RedisClient } from 'redis'
import { mocked } from 'ts-jest/utils'
import uuid from 'uuid'
import DraftsService from './draftsService'

jest.mock('uuid')
const mockedUuid = mocked(uuid)

interface ChosenRedisOverloads {
  get: (key: string, cb?: Callback<string | null>) => boolean
  set: (key: string, value: string, mode: string, duration: number, cb?: Callback<'OK' | undefined>) => boolean
  del: (key: string, cb?: Callback<number>) => boolean
}

const redis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
} as unknown as jest.Mocked<ChosenRedisOverloads> & RedisClient

const expiry = { seconds: 24 * 60 * 60 }

describe(DraftsService, () => {
  const clock = { now: () => new Date('2021-04-01T10:25:00Z') }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('.createDraft', () => {
    it('generates a random UUID and stores the data in Redis under a key derived from that UUID, with the given expiry time', async () => {
      mockedUuid.v4.mockReturnValue('2dc7ef56-58dd-4339-9924-c33318738068')

      redis.set.mockImplementation((_key, _value, _mode, _duration, cb) => {
        cb!(null, 'OK')
        return true
      })

      const draftsService = new DraftsService(redis, expiry, clock)

      const draft = await draftsService.createDraft('someExampleType', { a: 1, b: 2 }, { userId: 'someUserId' })

      expect(draft).toEqual({
        id: '2dc7ef56-58dd-4339-9924-c33318738068',
        type: 'someExampleType',
        createdAt: new Date('2021-04-01T10:25:00Z'),
        createdBy: { id: 'someUserId' },
        updatedAt: new Date('2021-04-01T10:25:00Z'),
        data: { a: 1, b: 2 },
      })

      expect(redis.set).toHaveBeenCalledWith(
        'draft:2dc7ef56-58dd-4339-9924-c33318738068',
        expect.anything(),
        'EX',
        expiry.seconds,
        expect.anything()
      )

      expect(JSON.parse(redis.set.mock.calls[0][1])).toEqual({
        id: '2dc7ef56-58dd-4339-9924-c33318738068',
        type: 'someExampleType',
        createdAt: '2021-04-01T10:25:00.000Z',
        createdBy: { id: 'someUserId' },
        updatedAt: '2021-04-01T10:25:00.000Z',
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

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, data)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        const draft = await draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })

        expect(draft).toEqual({
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: new Date('2021-04-01T10:25:00Z'),
          createdBy: { id: 'someUserId' },
          updatedAt: new Date('2021-04-01T10:25:00Z'),
          data: { a: 1, b: 2 },
        })

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything())
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

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, data)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await expect(
          draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything())
      })
    })

    describe('when Redis doesn’t contain a draft for that ID', () => {
      it('returns null', async () => {
        const draftsService = new DraftsService(redis, expiry, clock)

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, null)
          return true
        })

        expect(
          await draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).toBeNull()

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything())
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

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, initialData)
          return true
        })

        redis.set.mockImplementation((_key, _value, _mode, _duration, cb) => {
          cb!(null, 'OK')
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await draftsService.updateDraft(
          '2dc7ef56-58dd-4339-9924-c33318738068',
          { c: 3, d: 4 },
          { userId: 'someUserId' }
        )

        expect(redis.set).toHaveBeenCalledWith(
          'draft:2dc7ef56-58dd-4339-9924-c33318738068',
          expect.anything(),
          'EX',
          expiry.seconds,
          expect.anything()
        )

        expect(JSON.parse(redis.set.mock.calls[0][1])).toEqual({
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-03-10T11:50:00.000Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-04-01T10:25:00.000Z',
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

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, initialData)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await expect(
          draftsService.updateDraft('2dc7ef56-58dd-4339-9924-c33318738068', { c: 3, d: 4 }, { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.set).not.toHaveBeenCalled()
      })
    })

    describe('when Redis doesn’t contain a draft for that ID', () => {
      it('throws an error', async () => {
        redis.get.mockImplementation((_key, cb) => {
          cb!(null, null)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await expect(
          draftsService.updateDraft('2dc7ef56-58dd-4339-9924-c33318738068', { c: 3, d: 4 }, { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.get).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything())

        expect(redis.set).not.toHaveBeenCalled()
      })
    })
  })

  describe('.deleteDraft', () => {
    describe('when Redis contains a draft for that ID, created by the specified user', () => {
      it('removes that draft from Redis', async () => {
        const dto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-04-01T10:25:00Z',
          data: { a: 1, b: 2 },
        }
        const data = JSON.stringify(dto)

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, data)
          return true
        })

        redis.del.mockImplementation((_key, cb) => {
          cb!(null, 1)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })

        expect(redis.del).toHaveBeenCalledWith('draft:2dc7ef56-58dd-4339-9924-c33318738068', expect.anything())
      })
    })

    describe('when Redis contains a draft for that ID, created by a different user', () => {
      it('throws an error and does not remove that draft', async () => {
        const dto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00Z',
          createdBy: { id: 'someOtherUserId' },
          updatedAt: '2021-04-01T10:25:00Z',
          data: { a: 1, b: 2 },
        }
        const data = JSON.stringify(dto)

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, data)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await expect(
          draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.del).not.toHaveBeenCalled()
      })
    })

    describe('when Redis doesn’t contain a draft for that ID, as indicated by the Redis GET command', () => {
      it('throws an error', async () => {
        redis.get.mockImplementation((_key, cb) => {
          cb!(null, null)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await expect(
          draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).rejects.toThrow()

        expect(redis.del).not.toHaveBeenCalled()
      })
    })

    describe('when Redis doesn’t contain a draft for that ID, as indicated by the Redis DEL command', () => {
      it('throws an error', async () => {
        const dto = {
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-04-01T10:25:00Z',
          createdBy: { id: 'someUserId' },
          updatedAt: '2021-04-01T10:25:00Z',
          data: { a: 1, b: 2 },
        }
        const data = JSON.stringify(dto)

        redis.get.mockImplementation((_key, cb) => {
          cb!(null, data)
          return true
        })

        redis.del.mockImplementation((_key, cb) => {
          cb!(null, 0)
          return true
        })

        const draftsService = new DraftsService(redis, expiry, clock)

        await expect(
          draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', { userId: 'someUserId' })
        ).rejects.toThrow()
      })
    })
  })
})
