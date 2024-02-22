import TestUtils from '../../../../../../../testutils/testUtils'
import NoSessionYesAttendedFeedbackForm from './noSessionYesAttendedFeedbackForm'
import { NoSessionReasonType } from '../../../../../../models/sessionFeedback'

describe(NoSessionYesAttendedFeedbackForm, () => {
  describe('data', () => {
    describe('with valid data', () => {
      it('returns a paramsForUpdate for pop acceptable', async () => {
        const request = TestUtils.createRequest({
          'no-session-reason-type': 'POP_ACCEPTABLE',
          'no-session-reason-pop-acceptable': 'some info',
          'notify-probation-practitioner': 'no',
        })

        const data = await new NoSessionYesAttendedFeedbackForm(request).data()

        expect(data.paramsForUpdate?.noSessionReasonType).toEqual(NoSessionReasonType.POP_ACCEPTABLE)
        expect(data.paramsForUpdate?.noSessionReasonPopAcceptable).toEqual('some info')
        expect(data.paramsForUpdate?.notifyProbationPractitionerOfConcerns).toEqual(false)
      })

      it('returns a paramsForUpdate for pop unacceptable', async () => {
        const request = TestUtils.createRequest({
          'no-session-reason-type': 'POP_UNACCEPTABLE',
          'no-session-reason-pop-unacceptable': 'some info',
          'notify-probation-practitioner': 'no',
        })

        const data = await new NoSessionYesAttendedFeedbackForm(request).data()

        expect(data.paramsForUpdate?.noSessionReasonType).toEqual(NoSessionReasonType.POP_UNACCEPTABLE)
        expect(data.paramsForUpdate?.noSessionReasonPopUnacceptable).toEqual('some info')
        expect(data.paramsForUpdate?.notifyProbationPractitionerOfConcerns).toEqual(false)
      })

      it('returns a paramsForUpdate for sp logistics', async () => {
        const request = TestUtils.createRequest({
          'no-session-reason-type': 'LOGISTICS',
          'no-session-reason-logistics': 'some info',
          'notify-probation-practitioner': 'no',
        })

        const data = await new NoSessionYesAttendedFeedbackForm(request).data()

        expect(data.paramsForUpdate?.noSessionReasonType).toEqual(NoSessionReasonType.LOGISTICS)
        expect(data.paramsForUpdate?.noSessionReasonLogistics).toEqual('some info')
        expect(data.paramsForUpdate?.notifyProbationPractitionerOfConcerns).toEqual(false)
      })

      it('returns a paramsForUpdate and notify pp gets set to true', async () => {
        const request = TestUtils.createRequest({
          'no-session-reason-type': 'LOGISTICS',
          'no-session-reason-logistics': 'some info',
          'notify-probation-practitioner': 'yes',
          'session-concerns': 'some concerns',
        })

        const data = await new NoSessionYesAttendedFeedbackForm(request).data()

        expect(data.paramsForUpdate?.noSessionReasonType).toEqual(NoSessionReasonType.LOGISTICS)
        expect(data.paramsForUpdate?.noSessionReasonLogistics).toEqual('some info')
        expect(data.paramsForUpdate?.notifyProbationPractitionerOfConcerns).toEqual(true)
        expect(data.paramsForUpdate?.sessionConcerns).toEqual('some concerns')
      })
    })

    describe('invalid fields', () => {
      describe('returns errors when required fields are not present', () => {
        it('no-session-reason-pop-unacceptable missing when pop unacceptable type is selected.', async () => {
          const request = TestUtils.createRequest({
            'no-session-reason-type': 'POP_UNACCEPTABLE',
            'notify-probation-practitioner': 'no',
          })

          const data = await new NoSessionYesAttendedFeedbackForm(request).data()

          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'no-session-reason-pop-unacceptable',
            formFields: ['no-session-reason-pop-unacceptable'],
            message: 'Enter details about why they were not able to take part',
          })
        })

        it('no-session-reason-pop-acceptable missing when pop acceptable type is selected.', async () => {
          const request = TestUtils.createRequest({
            'no-session-reason-type': 'POP_ACCEPTABLE',
            'notify-probation-practitioner': 'no',
          })

          const data = await new NoSessionYesAttendedFeedbackForm(request).data()

          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'no-session-reason-pop-acceptable',
            formFields: ['no-session-reason-pop-acceptable'],
            message: 'Enter what happened and who was involved',
          })
        })

        it('no-session-reason-logistics missing when logistics type is selected.', async () => {
          const request = TestUtils.createRequest({
            'no-session-reason-type': 'LOGISTICS',
            'notify-probation-practitioner': 'no',
          })

          const data = await new NoSessionYesAttendedFeedbackForm(request).data()

          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'no-session-reason-logistics',
            formFields: ['no-session-reason-logistics'],
            message: 'Enter details about the service provider or logistics issue',
          })
        })

        it('returns errors when required fields are not present', async () => {
          const request = TestUtils.createRequest({})

          const data = await new NoSessionYesAttendedFeedbackForm(request).data()

          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'no-session-reason-type',
            formFields: ['no-session-reason-type'],
            message: 'Select why the session did not happen',
          })
          expect(data.error?.errors).toContainEqual({
            errorSummaryLinkedField: 'notify-probation-practitioner',
            formFields: ['notify-probation-practitioner'],
            message: "Select 'no' if the probation practitioner does not need to be notified",
          })
        })

        it('returns the error when yes is selected for notify probation practitioner but session concerns is empty', async () => {
          const request = TestUtils.createRequest({
            'no-session-reason-type': 'POP_ACCEPTABLE',
            'no-session-reason-pop-acceptable': 'some info',
            'session-concerns': '',
            'notify-probation-practitioner': 'yes',
          })

          const data = await new NoSessionYesAttendedFeedbackForm(request).data()

          expect(data.error?.errors).toEqual([
            {
              errorSummaryLinkedField: 'session-concerns',
              formFields: ['session-concerns'],
              message: 'Enter a description of what concerned you',
            },
          ])
        })

        it('returns the error when notify probation practitioner value is missing', async () => {
          const request = TestUtils.createRequest({
            'no-session-reason-type': 'POP_ACCEPTABLE',
            'no-session-reason-pop-acceptable': 'some info',
            'session-summary': 'summary',
          })

          const data = await new NoSessionYesAttendedFeedbackForm(request).data()

          expect(data.error?.errors).toEqual([
            {
              errorSummaryLinkedField: 'notify-probation-practitioner',
              formFields: ['notify-probation-practitioner'],
              message: "Select 'no' if the probation practitioner does not need to be notified",
            },
          ])
        })
      })
    })
  })
})
