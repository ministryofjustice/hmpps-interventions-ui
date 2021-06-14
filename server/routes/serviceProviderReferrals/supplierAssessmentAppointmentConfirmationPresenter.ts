import SentReferral from '../../models/sentReferral'

export default class SupplierAssessmentAppointmentConfirmationPresenter {
  constructor(private readonly referral: SentReferral, private readonly isReschedule: boolean) {}

  readonly title = `Initial assessment appointment ${this.isReschedule ? 'updated' : 'added'}`

  readonly progressHref = `/service-provider/referrals/${this.referral.id}/progress`
}
