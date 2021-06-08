import { Response } from 'express'
import ControllerUtils from './controllerUtils'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'

describe(ControllerUtils, () => {
  describe('.renderWithLayout', () => {
    describe('with null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs augmented with a headerPresenter object in the locals', () => {
        const res = { render: jest.fn(), locals: { user: null } } as unknown as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }

        ControllerUtils.renderWithLayout(res, contentView, null)

        expect(res.render).toHaveBeenCalledWith('myTemplate', {
          foo: '1',
          bar: '2',
          headerPresenter: expect.anything(),
        })
      })
    })

    describe('with non-null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs, augmented with headerPresenter and serviceUserNotificationBannerArgs objects in the locals', () => {
        const res = { render: jest.fn(), locals: { user: null } } as unknown as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }
        const serviceUser = deliusServiceUserFactory.build()

        ControllerUtils.renderWithLayout(res, contentView, serviceUser)

        expect(res.render).toHaveBeenCalledWith('myTemplate', {
          foo: '1',
          bar: '2',
          headerPresenter: expect.anything(),
          serviceUserNotificationBannerArgs: expect.anything(),
        })
      })
    })
  })
})
