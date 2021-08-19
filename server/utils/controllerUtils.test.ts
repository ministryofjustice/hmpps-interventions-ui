import { Request, Response } from 'express'
import ControllerUtils from './controllerUtils'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import config from '../config'
import DraftsService from '../services/draftsService'
import { createDraftFactory } from '../../testutils/factories/draft'

describe(ControllerUtils, () => {
  describe('.renderWithLayout', () => {
    describe('with null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs augmented with a headerPresenter object in the locals', () => {
        const res = { render: jest.fn(), locals: { user: null } } as unknown as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }
        config.googleAnalyticsTrackingId = 'UA-TEST-ID'

        ControllerUtils.renderWithLayout(res, contentView, null)

        expect(res.render).toHaveBeenCalledWith('myTemplate', {
          foo: '1',
          bar: '2',
          headerPresenter: expect.anything(),
          googleAnalyticsTrackingId: 'UA-TEST-ID',
        })
      })
    })

    describe('with non-null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs, augmented with headerPresenter and serviceUserNotificationBannerArgs objects in the locals', () => {
        const res = { render: jest.fn(), locals: { user: null } } as unknown as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }
        const serviceUser = deliusServiceUserFactory.build()
        config.googleAnalyticsTrackingId = 'UA-TEST-ID'

        ControllerUtils.renderWithLayout(res, contentView, serviceUser)

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

        const fetchedDraft = await ControllerUtils.fetchDraft(
          { params: { draftBookingId: 'abc123' } } as unknown as Request,
          { locals: { user: { userId: 'jane.bloggs' } } } as unknown as Response,
          draftsService,
          {
            idParamName: 'draftBookingId',
            typeName: 'booking',
            notFoundUserMessage: 'Timed out, start again',
          }
        )

        expect(fetchedDraft).toEqual(draft)

        expect(draftsService.fetchDraft).toHaveBeenCalledWith('abc123', { userId: 'jane.bloggs' })
      })
    })

    describe('when a draft is not found by the drafts service', () => {
      it('throws an error', async () => {
        draftsService.fetchDraft.mockResolvedValue(null)

        let thrownError: Error | null = null

        try {
          await ControllerUtils.fetchDraft(
            { params: { draftBookingId: 'abc123' } } as unknown as Request,
            { locals: { user: { userId: 'jane.bloggs' } } } as unknown as Response,
            draftsService,
            {
              idParamName: 'draftBookingId',
              typeName: 'booking',
              notFoundUserMessage: 'Timed out, start again',
            }
          )
        } catch (e) {
          thrownError = e
        }

        expect(thrownError).toMatchObject({
          status: 500,
          message: `Draft booking with ID abc123 not found by drafts service`,
          userMessage: 'Timed out, start again',
        })
      })
    })
  })
})
