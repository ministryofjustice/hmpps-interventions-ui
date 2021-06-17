import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'
import appointmentFactory from '../../testutils/factories/appointment'
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
          const appointments = appointmentFactory.buildList(3)
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
            appointments: appointmentFactory.buildList(3),
            currentAppointmentId: appointmentFactory.build().id,
          })

          const decorator = new SupplierAssessmentDecorator(supplierAssessment)

          expect(() => decorator.currentAppointment).toThrow()
        })
      })
    })
  })
})
