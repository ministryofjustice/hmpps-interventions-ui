import { Response } from 'express'
import ControllerUtils from './controllerUtils'

describe(ControllerUtils, () => {
  describe('.renderWithLayout', () => {
    it('calls render on the response, passing the content view’s renderArgs', () => {
      const res = ({ render: jest.fn() } as unknown) as Response
      const renderArgs: [string, Record<string, unknown>] = ['myTemplate', { foo: '1', bar: '2' }]
      const contentView = { renderArgs }

      ControllerUtils.renderWithLayout(res, contentView)

      expect(res.render).toHaveBeenCalledWith('myTemplate', { foo: '1', bar: '2' })
    })
  })
})
