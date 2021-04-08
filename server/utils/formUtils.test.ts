import { Request } from 'express'
import { body } from 'express-validator'
import FormUtils from './formUtils'

describe('FormUtils', () => {
  describe('yesNoRadioWithConditionalInputValidationChain', () => {
    async function validationResultForBody(requestBody: Record<string, unknown>) {
      const validations = FormUtils.yesNoRadioWithConditionalInputValidationChain({
        radioName: 'needs-interpreter',
        inputName: 'interpreter-language',
        notSelectedErrorMessage: 'Select yes if an interpreter is needed',
        inputValidator: chain => chain.notEmpty().withMessage('Enter the language for which an interpreter is needed'),
      })

      const request = { body: requestBody } as Request

      return FormUtils.runValidations({ request, validations })
    }

    it('returns an error when the radio buttons question is not answered', async () => {
      const result = await validationResultForBody({ 'interpreter-language': '' })
      expect(result.array()).toEqual([
        {
          param: 'needs-interpreter',
          msg: 'Select yes if an interpreter is needed',
          value: undefined,
          location: 'body',
        },
      ])
    })

    it("returns an error when the radio buttons question is answered with neither 'yes' nor 'no'", async () => {
      const result = await validationResultForBody({ 'needs-interpreter': 'true', 'interpreter-language': '' })
      expect(result.array()).toEqual([
        {
          param: 'needs-interpreter',
          msg: 'Select yes if an interpreter is needed',
          value: 'true',
          location: 'body',
        },
      ])
    })

    it("returns an error when the radio buttons answer is 'yes' and the input is invalid", async () => {
      const result = await validationResultForBody({ 'needs-interpreter': 'yes', 'interpreter-language': '' })
      expect(result.array()).toEqual([
        {
          param: 'interpreter-language',
          msg: 'Enter the language for which an interpreter is needed',
          value: '',
          location: 'body',
        },
      ])
    })

    it("returns no error when the radio buttons answer is 'yes' and the input is valid", async () => {
      const result = await validationResultForBody({ 'needs-interpreter': 'yes', 'interpreter-language': 'spanish' })
      expect(result.array()).toEqual([])
    })

    it("returns no error when the radio buttons answer is 'no' and the input is invalid", async () => {
      const result = await validationResultForBody({ 'needs-interpreter': 'no', 'interpreter-language': '' })
      expect(result.array()).toEqual([])
    })
  })

  describe('runValidations', () => {
    it('runs all the validations on the request and returns a validation result', async () => {
      const validations = [
        body('field1').notEmpty().withMessage('field1 is empty'),
        body('field2').notEmpty().withMessage('field2 is empty'),
        body('field3').notEmpty().withMessage('field3 is empty'),
      ]

      const request = { body: { field1: 'Hello', field2: '', field3: '' } } as Request

      const result = await FormUtils.runValidations({ request, validations })

      expect(result.array()).toEqual([
        { location: 'body', msg: 'field2 is empty', param: 'field2', value: '' },
        { location: 'body', msg: 'field3 is empty', param: 'field3', value: '' },
      ])
    })

    it('can be used multiple times on the same request with different validations', async () => {
      const validations = [body('field2').notEmpty().withMessage('field2 is empty')]
      const secondValidations = [body('field3').notEmpty().withMessage('field3 is empty')]

      const request = { body: { field1: 'Hello', field2: '', field3: '' } } as Request

      const result = await FormUtils.runValidations({ request, validations })
      const secondResult = await FormUtils.runValidations({ request, validations: secondValidations })

      expect(result.array()).toEqual([{ location: 'body', msg: 'field2 is empty', param: 'field2', value: '' }])
      expect(secondResult.array()).toEqual([{ location: 'body', msg: 'field3 is empty', param: 'field3', value: '' }])
    })
  })
})
