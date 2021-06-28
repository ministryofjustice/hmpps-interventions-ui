import { Request } from 'express'
import { mocked } from 'ts-jest/utils'
import uuid from 'uuid'
import DraftsService from './draftsService'

jest.mock('uuid')
const mockedUuid = mocked(uuid)

describe(DraftsService, () => {
  function createRequestWithSession(session: unknown): Request {
    return { session } as unknown as Request
  }

  const clock = { now: () => new Date('2021-04-01T10:25:00Z') }

  describe('.createDraft', () => {
    it('generates a random UUID and stores the data in the session under a key derived from that UUID', () => {
      mockedUuid.v4.mockReturnValue('2dc7ef56-58dd-4339-9924-c33318738068')
      const req = createRequestWithSession({})

      const draftsService = new DraftsService(clock)

      const draft = draftsService.createDraft('someExampleType', { a: 1, b: 2 }, req)

      expect(draft).toEqual({
        id: '2dc7ef56-58dd-4339-9924-c33318738068',
        type: 'someExampleType',
        createdAt: new Date('2021-04-01T10:25:00Z'),
        updatedAt: new Date('2021-04-01T10:25:00Z'),
        data: { a: 1, b: 2 },
      })

      expect(req.session['draft-2dc7ef56-58dd-4339-9924-c33318738068']).toEqual({
        id: '2dc7ef56-58dd-4339-9924-c33318738068',
        type: 'someExampleType',
        createdAt: '2021-04-01T10:25:00.000Z',
        updatedAt: '2021-04-01T10:25:00.000Z',
        data: { a: 1, b: 2 },
      })
    })
  })

  describe('.fetchDraft', () => {
    describe('when the session contains a draft for that ID', () => {
      it('returns that draft', () => {
        const req = createRequestWithSession({
          'draft-2dc7ef56-58dd-4339-9924-c33318738068': {
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-04-01T10:25:00Z',
            updatedAt: '2021-04-01T10:25:00Z',
            data: { a: 1, b: 2 },
          },
        })

        const draftsService = new DraftsService(clock)

        const draft = draftsService.fetchDraft('2dc7ef56-58dd-4339-9924-c33318738068', req)

        expect(draft).toEqual({
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: new Date('2021-04-01T10:25:00Z'),
          updatedAt: new Date('2021-04-01T10:25:00Z'),
          data: { a: 1, b: 2 },
        })
      })
    })

    describe('when the session doesn’t contain a draft for that ID', () => {
      it('throws an error', () => {
        const req = createRequestWithSession({
          'draft-2dc7ef56-58dd-4339-9924-c33318738068': {
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-04-01T10:25:00Z',
            updatedAt: '2021-04-01T10:25:00Z',
            data: { a: 1, b: 2 },
          },
        })

        const draftsService = new DraftsService(clock)

        expect(() => draftsService.fetchDraft('def456', req)).toThrow()
      })
    })
  })

  describe('.updateDraft', () => {
    describe('when the session contains a draft for that ID', () => {
      it('updates that draft in the session and bumps the updatedAt property', () => {
        const req = createRequestWithSession({
          'draft-2dc7ef56-58dd-4339-9924-c33318738068': {
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-03-10T11:50:00Z',
            updatedAt: '2021-03-10T11:50:00Z',
            data: { a: 1, b: 2 },
          },
        })

        const draftsService = new DraftsService(clock)

        draftsService.updateDraft('2dc7ef56-58dd-4339-9924-c33318738068', { c: 3, d: 4 }, req)

        expect(req.session['draft-2dc7ef56-58dd-4339-9924-c33318738068']).toEqual({
          id: '2dc7ef56-58dd-4339-9924-c33318738068',
          type: 'someExampleType',
          createdAt: '2021-03-10T11:50:00.000Z',
          updatedAt: '2021-04-01T10:25:00.000Z',
          data: { c: 3, d: 4 },
        })
      })
    })

    describe('when the session doesn’t contain a draft for that ID', () => {
      it('throws an error', () => {
        const req = createRequestWithSession({
          'draft-2dc7ef56-58dd-4339-9924-c33318738068': {
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-03-10T11:50:00Z',
            updatedAt: '2021-03-10T11:50:00Z',
            data: { a: 1, b: 2 },
          },
        })

        const draftsService = new DraftsService(clock)

        expect(() => draftsService.updateDraft('def456', { c: 3, d: 4 }, req)).toThrow()
      })
    })
  })

  describe('.deleteDraft', () => {
    describe('when the session contains a draft for that ID', () => {
      it('removes that draft from the session', () => {
        const req = createRequestWithSession({
          'draft-2dc7ef56-58dd-4339-9924-c33318738068': {
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-03-10T11:50:00Z',
            updatedAt: '2021-03-10T11:50:00Z',
            data: { a: 1, b: 2 },
          },
        })

        const draftsService = new DraftsService(clock)

        draftsService.deleteDraft('2dc7ef56-58dd-4339-9924-c33318738068', req)

        expect(req.session['draft-2dc7ef56-58dd-4339-9924-c33318738068']).toBeUndefined()
      })
    })

    describe('when the session doesn’t contain a draft for that ID', () => {
      it('throws an error', () => {
        const req = createRequestWithSession({
          'draft-2dc7ef56-58dd-4339-9924-c33318738068': {
            id: '2dc7ef56-58dd-4339-9924-c33318738068',
            type: 'someExampleType',
            createdAt: '2021-03-10T11:50:00Z',
            updatedAt: '2021-03-10T11:50:00Z',
            data: { a: 1, b: 2 },
          },
        })

        const draftsService = new DraftsService(clock)

        expect(() => draftsService.deleteDraft('def456', req)).toThrow()
      })
    })
  })
})
