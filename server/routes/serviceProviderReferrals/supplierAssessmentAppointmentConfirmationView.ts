import SupplierAssessmentAppointmentConfirmationPresenter from './supplierAssessmentAppointmentConfirmationPresenter'

export default class SupplierAssessmentAppointmentConfirmationView {
  constructor(private readonly presenter: SupplierAssessmentAppointmentConfirmationPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/supplierAssessmentAppointmentConfirmation',
      {
        presenter: this.presenter,
      },
    ]
  }
}
