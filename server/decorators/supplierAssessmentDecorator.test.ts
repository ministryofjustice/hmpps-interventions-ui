import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../testutils/factories/initialAssessmentAppointment'
import SupplierAssessmentDecorator from './supplierAssessmentDecorator'

describe(SupplierAssessmentDecorator, () => {
  describe('currentAppointment', () => {
    describe('when currentAppointmentId is null', () => {
      it('returns null', () => {
        const supplierAssessment = supplierAssessmentFactory.build({ currentAppointmentId: null })

        const decorator = new SupplierAssessmentDecorator(supplierAssessment)

        expect(decorator.currentAppointment).toBeNull()
      })
    })

    describe('when currentAppointmentId is non-null', () => {
      describe('and the assessment’s appointments contain an appointment with that ID', () => {
        it('returns that appointment', () => {
          const appointments = initialAssessmentAppointmentFactory.buildList(3)
          const supplierAssessment = supplierAssessmentFactory.build({
            appointments,
            currentAppointmentId: appointments[2].id,
          })

          const decorator = new SupplierAssessmentDecorator(supplierAssessment)

          expect(decorator.currentAppointment).toEqual(appointments[2])
        })
      })

      describe('and the assessment’s appointments don’t contain an appointment with that ID', () => {
        it('throws an error', () => {
          const supplierAssessment = supplierAssessmentFactory.build({
            appointments: initialAssessmentAppointmentFactory.buildList(3),
            currentAppointmentId: initialAssessmentAppointmentFactory.build().id,
          })

          const decorator = new SupplierAssessmentDecorator(supplierAssessment)

          expect(() => decorator.currentAppointment).toThrow()
        })
      })
    })
  })
})
