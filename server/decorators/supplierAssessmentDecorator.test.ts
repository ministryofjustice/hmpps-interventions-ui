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

  describe('appointmentDateAndTime', () => {
    describe('when the appointment has been scheduled', () => {
      it('returns a formatted date and time', () => {
        const currentAppointment = initialAssessmentAppointmentFactory.build({
          appointmentTime: '2021-10-10T01:00:00+01:00',
        })
        const olderAppointment = initialAssessmentAppointmentFactory.build({
          appointmentTime: '2021-10-09T12:00:00+01:00',
        })
        const appointments = [currentAppointment, olderAppointment]

        const supplierAssessment = supplierAssessmentFactory.build({
          appointments,
        })

        const decorator = new SupplierAssessmentDecorator(supplierAssessment)

        expect(decorator.appointmentDateAndTime(currentAppointment)).toEqual('1:00am on 10 Oct 2021')
        expect(decorator.appointmentDateAndTime(olderAppointment)).toEqual('Midday on 9 Oct 2021')
      })
    })

    describe('when the appointment has not been scheduled', () => {
      it('returns N/A', () => {
        const currentAppointment = initialAssessmentAppointmentFactory.build({
          appointmentTime: null,
        })
        const appointments = [currentAppointment, ...initialAssessmentAppointmentFactory.buildList(2)]

        const supplierAssessment = supplierAssessmentFactory.build({
          appointments,
        })

        const decorator = new SupplierAssessmentDecorator(supplierAssessment)

        expect(decorator.appointmentDateAndTime(currentAppointment)).toEqual('N/A')
      })
    })

    describe('when the appointment is null', () => {
      it('returns null', () => {
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: initialAssessmentAppointmentFactory.buildList(2),
        })

        const decorator = new SupplierAssessmentDecorator(supplierAssessment)

        expect(decorator.appointmentDateAndTime(null)).toEqual('N/A')
      })
    })
  })
})
