import { Response } from 'express'
import ControllerUtils from './controllerUtils'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'

describe(ControllerUtils, () => {
  describe('.renderWithLayout', () => {
    describe('with null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs', () => {
        const res = ({ render: jest.fn() } as unknown) as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }

        ControllerUtils.renderWithLayout(res, contentView, null)

        expect(res.render).toHaveBeenCalledWith('myTemplate', { foo: '1', bar: '2' })
      })
    })

    describe('with non-null serviceUser', () => {
      it('calls render on the response, passing the content view’s renderArgs, augmented with a serviceUserNotificationBannerArgs object in the locals', () => {
        const res = ({ render: jest.fn() } as unknown) as Response
        const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
        const contentView = { renderArgs }
        const serviceUser = deliusServiceUserFactory.build()

        ControllerUtils.renderWithLayout(res, contentView, serviceUser)

        expect(res.render).toHaveBeenCalledWith('myTemplate', {
          foo: '1',
          bar: '2',
          serviceUserNotificationBannerArgs: expect.anything(),
        })
      })
    })
  })
})
