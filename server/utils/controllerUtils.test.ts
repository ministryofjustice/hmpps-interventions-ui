import { Request, Response } from 'express'
import { ParsedQs } from 'qs'
import ControllerUtils from './controllerUtils'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import config from '../config'
import DraftsService from '../services/draftsService'
import UserDataService from '../services/userDataService'
import { createDraftFactory } from '../../testutils/factories/draft'
import loggedInUser from '../../testutils/factories/loggedInUser'

describe(ControllerUtils, () => {
  describe('parseQueryParamAsPositiveInteger', () => {
    it('returns null for missing query param', () => {
      expect(
        ControllerUtils.parseQueryParamAsPositiveInteger({ query: {} as ParsedQs } as Request, 'missing')
      ).toBeNull()
    })

    it('returns null for invalid int values', () => {
      const req = {
        query: { value1: '[]', value2: '-1', value3: 'NaN', value4: '0', value5: [] } as ParsedQs,
      } as Request
      expect(ControllerUtils.parseQueryParamAsPositiveInteger(req, 'value1')).toBeNull()
      expect(ControllerUtils.parseQueryParamAsPositiveInteger(req, 'value2')).toBeNull()
      expect(ControllerUtils.parseQueryParamAsPositiveInteger(req, 'value3')).toBeNull()
      expect(ControllerUtils.parseQueryParamAsPositiveInteger(req, 'value4')).toBeNull()
      expect(ControllerUtils.parseQueryParamAsPositiveInteger(req, 'value5')).toBeNull()
    })

    it('returns a number for valid int values', () => {
      const req = { query: { value1: '12', value2: '345' } as ParsedQs } as Request
      expect(ControllerUtils.parseQueryParamAsPositiveInteger(req, 'value1')).toEqual(12)
      expect(ControllerUtils.parseQueryParamAsPositiveInteger(req, 'value2')).toEqual(345)
    })
  })

  describe('.renderWithLayout', () => {
    describe('with null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs augmented with a headerPresenter object in the locals', async () => {
        const req = { render: jest.fn(), locals: { user: null } } as unknown as Request
        const res = { render: jest.fn(), locals: { user: null } } as unknown as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }
        config.googleAnalyticsTrackingId = 'UA-TEST-ID'

        await ControllerUtils.renderWithLayout(req, res, contentView, null, null)

        expect(res.render).toHaveBeenCalledWith('myTemplate', {
          foo: '1',
          bar: '2',
          headerPresenter: expect.anything(),
          googleAnalyticsTrackingId: 'UA-TEST-ID',
        })
      })
    })

    describe('with non-null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs, augmented with headerPresenter and serviceUserNotificationBannerArgs objects in the locals', async () => {
        const req = { render: jest.fn(), locals: { user: null } } as unknown as Request
        const res = { render: jest.fn(), locals: { user: null } } as unknown as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }
        const serviceUser = deliusServiceUserFactory.build()
        config.googleAnalyticsTrackingId = 'UA-TEST-ID'

        await ControllerUtils.renderWithLayout(req, res, contentView, serviceUser, null)

        expect(res.render).toHaveBeenCalledWith('myTemplate', {
          foo: '1',
          bar: '2',
          headerPresenter: expect.anything(),
          googleAnalyticsTrackingId: 'UA-TEST-ID',
          serviceUserBannerPresenter: expect.anything(),
        })
      })
    })
  })

  describe('fetchDraft', () => {
    const draftsService = {
      fetchDraft: jest.fn(),
    } as unknown as jest.Mocked<DraftsService>

    const exampleDraftFactory = createDraftFactory<Record<string, unknown>>({})

    beforeEach(() => {
      jest.resetAllMocks()
    })

    describe('when a draft is found by the drafts service', () => {
      it('returns the draft', async () => {
        const draft = exampleDraftFactory.build({ data: { a: 1 } })
        draftsService.fetchDraft.mockResolvedValue(draft)

        const result = await ControllerUtils.fetchDraftOrRenderMessage(
          { params: { draftBookingId: 'abc123' } } as unknown as Request,
          { locals: { user: { userId: 'jane.bloggs' } } } as unknown as Response,
          draftsService,
          null,
          {
            idParamName: 'draftBookingId',
            typeName: 'booking',
            notFoundUserMessage: 'Timed out, start again',
          }
        )

        expect(result).toEqual({ rendered: false, draft })

        expect(draftsService.fetchDraft).toHaveBeenCalledWith('abc123', { userId: 'jane.bloggs' })
      })
    })

    describe('when the draft has been soft-deleted', () => {
      it('renders an explanatory page when notFoundUserMessage is passed in', async () => {
        const draft = exampleDraftFactory.build({ softDeleted: true })
        draftsService.fetchDraft.mockResolvedValue(draft)

        const res = { status: jest.fn(), locals: { user: { userId: 'jane.bloggs' } }, render: jest.fn() }

        const result = await ControllerUtils.fetchDraftOrRenderMessage(
          { params: { draftBookingId: 'abc123' } } as unknown as Request,
          res as unknown as Response,
          draftsService,
          null,
          {
            idParamName: 'draftBookingId',
            typeName: 'booking',
            notFoundUserMessage: 'not found message',
          }
        )

        expect(result).toEqual({ rendered: true })

        expect(res.status).toHaveBeenCalledWith(410)
        expect(res.render).toHaveBeenCalledWith(
          'shared/draftSoftDeleted',
          expect.objectContaining({
            softDeletedUserMessage: 'not found message',
          })
        )
      })

      it('renders a default explanatory page when no user message is passed in', async () => {
        const draft = exampleDraftFactory.build({ softDeleted: true })
        draftsService.fetchDraft.mockResolvedValue(draft)

        const res = { status: jest.fn(), locals: { user: { userId: 'jane.bloggs' } }, render: jest.fn() }

        const result = await ControllerUtils.fetchDraftOrRenderMessage(
          { params: { draftBookingId: 'abc123' } } as unknown as Request,
          res as unknown as Response,
          draftsService,
          null,
          {
            idParamName: 'draftBookingId',
            typeName: 'booking',
          }
        )

        expect(result).toEqual({ rendered: true })

        expect(res.status).toHaveBeenCalledWith(410)
        expect(res.render).toHaveBeenCalledWith(
          'shared/draftSoftDeleted',
          expect.not.objectContaining({
            softDeletedUserMessage: expect.anything(),
          })
        )
      })
    })

    describe('when a draft is not found by the drafts service', () => {
      it('renders an explanatory page when notFoundUserMessage is passed in', async () => {
        draftsService.fetchDraft.mockResolvedValue(null)

        const res = { status: jest.fn(), locals: { user: { userId: 'jane.bloggs' } }, render: jest.fn() }

        const result = await ControllerUtils.fetchDraftOrRenderMessage(
          { params: { draftBookingId: 'abc123' } } as unknown as Request,
          res as unknown as Response,
          draftsService,
          null,
          {
            idParamName: 'draftBookingId',
            typeName: 'booking',
            notFoundUserMessage: 'not found message',
          }
        )

        expect(result).toEqual({ rendered: true })

        expect(res.status).toHaveBeenCalledWith(410)
        expect(res.render).toHaveBeenCalledWith(
          'shared/draftNotFound',
          expect.objectContaining({
            notFoundUserMessage: 'not found message',
          })
        )
      })

      it('renders an explanatory page when no user message is passed in', async () => {
        draftsService.fetchDraft.mockResolvedValue(null)

        const res = { status: jest.fn(), locals: { user: { userId: 'jane.bloggs' } }, render: jest.fn() }

        const result = await ControllerUtils.fetchDraftOrRenderMessage(
          { params: { draftBookingId: 'abc123' } } as unknown as Request,
          res as unknown as Response,
          draftsService,
          null,
          {
            idParamName: 'draftBookingId',
            typeName: 'booking',
          }
        )

        expect(result).toEqual({ rendered: true })

        expect(res.status).toHaveBeenCalledWith(410)
        expect(res.render).toHaveBeenCalledWith(
          'shared/draftNotFound',
          expect.not.objectContaining({
            notFoundUserMessage: expect.anything(),
          })
        )
      })
    })
  })

  describe('getSortOrderFromMojServerSideSortableTable', () => {
    const userDataService = {
      store: jest.fn(),
      retrieve: jest.fn(),
    } as unknown as jest.Mocked<UserDataService>

    beforeEach(() => {
      jest.resetAllMocks()
    })

    const res = { locals: { user: loggedInUser.probationUser().build() } } as unknown as Response

    it('falls back to the default value if there are none stored or provided in the url', async () => {
      userDataService.retrieve.mockResolvedValue(Promise.resolve(null))
      const req = { query: {} } as Request

      const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
        req,
        res,
        userDataService,
        100,
        'myTable',
        [],
        'default,DESC'
      )

      expect(sort).toEqual(['default,DESC'])
    })

    it('uses the stored value if no value is provided in the url', async () => {
      userDataService.retrieve.mockResolvedValue(Promise.resolve('storedSortField,ASC'))
      const req = { query: {} } as Request

      const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
        req,
        res,
        userDataService,
        100,
        'myTable',
        [],
        'default,DESC'
      )

      expect(sort).toEqual(['storedSortField,ASC'])
    })

    it('uses and stores the value passed in the url', async () => {
      const req = { query: { sort: 'querySortField,ascending' } as ParsedQs } as Request

      const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
        req,
        res,
        userDataService,
        100,
        'myTable',
        ['querySortField'],
        'default,DESC'
      )

      expect(sort).toEqual(['querySortField,ASC'])
      expect(userDataService.store).toHaveBeenCalled()
    })

    it('does not store invalid sort fields passed in the url, and falls back to the default', async () => {
      const req = { query: { sort: 'invalid,ascending' } as ParsedQs } as Request

      const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
        req,
        res,
        userDataService,
        100,
        'myTable',
        ['querySortField'],
        'default,DESC'
      )

      expect(sort).toEqual(['default,DESC'])
      expect(userDataService.store).not.toHaveBeenCalled()
    })

    it('does not store invalid sort order passed in the url, and falls back to the default', async () => {
      const req = { query: { sort: 'querySortField,unknown' } as ParsedQs } as Request

      const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
        req,
        res,
        userDataService,
        100,
        'myTable',
        ['querySortField'],
        'default,DESC',
        'secondary,ASC'
      )

      expect(sort).toEqual(['default,DESC', 'secondary,ASC'])
      expect(userDataService.store).not.toHaveBeenCalled()
    })

    it('applies the secondary sort if it is different to the primary sort', async () => {
      const req = { query: { sort: 'querySortField,ascending' } as ParsedQs } as Request

      const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
        req,
        res,
        userDataService,
        100,
        'myTable',
        ['querySortField'],
        'default,DESC',
        'secondary,ASC'
      )

      expect(sort).toEqual(['querySortField,ASC', 'secondary,ASC'])
    })

    it('does not apply the secondary sort if it is the same field as the primary sort', async () => {
      const req = { query: { sort: 'querySortField,ascending' } as ParsedQs } as Request

      const sort = await ControllerUtils.getSortOrderFromMojServerSideSortableTable(
        req,
        res,
        userDataService,
        100,
        'myTable',
        ['querySortField'],
        'default,DESC',
        'querySortField,DESC'
      )

      expect(sort).toEqual(['querySortField,ASC'])
    })
  })
})
