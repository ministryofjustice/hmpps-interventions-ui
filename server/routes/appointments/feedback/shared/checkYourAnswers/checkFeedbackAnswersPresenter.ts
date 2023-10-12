import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import FeedbackAnswersPresenter from '../viewFeedback/feedbackAnswersPresenter'
import AppointmentSummary from '../../../appointmentSummary'
import {SummaryListItem} from "../../../../../utils/summaryList";

export default abstract class CheckFeedbackAnswersPresenter {
  protected constructor(
    protected appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    readonly appointmentSummary: AppointmentSummary,
    readonly title: string
  ) {}

  abstract readonly submitHref: string

  abstract readonly backLinkHref: string

  abstract readonly feedbackAnswersPresenter: FeedbackAnswersPresenter

  // get probationPractitionerDetailsForCommunity(): SummaryListItem[] {
  //   const probationPractitionerDetails: SummaryListItem[] = []
  //   if (this.sentReferral.referral.ppName || this.sentReferral.referral.ndeliusPPName) {
  //     probationPractitionerDetails.push(
  //         {
  //           key: 'Name',
  //           lines: [this.sentReferral.referral.ppName || this.sentReferral.referral.ndeliusPPName || 'Not found'],
  //         },
  //         { key: 'Email address', lines: [this.deriveEmailAddress] }
  //     )
  //     if (this.userType === 'service-provider') {
  //       probationPractitionerDetails.push({
  //         key: 'Phone number',
  //         lines: [officer?.telephoneNumber || 'Not found'],
  //       })
  //     }
  //     probationPractitionerDetails.push({
  //       key:
  //           this.sentReferral.referral.ppProbationOffice !== null && this.sentReferral.referral.ppProbationOffice !== ''
  //               ? 'Probation Office'
  //               : 'PDU (Probation Delivery Unit)',
  //       lines: [
  //         this.sentReferral.referral.ppProbationOffice !== null && this.sentReferral.referral.ppProbationOffice !== ''
  //             ? this.sentReferral.referral.ppProbationOffice
  //             : this.sentReferral.referral.ppPdu || this.sentReferral.referral.ndeliusPDU || '',
  //       ],
  //     })
  //     if (this.userType === 'service-provider') {
  //       probationPractitionerDetails.push({
  //         key: 'Team phone number',
  //         lines: [officer?.team?.telephoneNumber || 'Not found'],
  //       })
  //     }
  //
  //     return probationPractitionerDetails
  //   }
  //   probationPractitionerDetails.push(
  //       {
  //         key: 'Name',
  //         lines: [`${officer?.name?.forename || ''} ${officer?.name?.surname || ''}`.trim() || 'Not found'],
  //       },
  //       { key: 'Email address', lines: [officer?.email || 'Not found'] }
  //   )
  //   if (this.userType === 'service-provider') {
  //     probationPractitionerDetails.push({
  //       key: 'Phone number',
  //       lines: [officer?.telephoneNumber || 'Not found'],
  //     })
  //   }
  //   probationPractitionerDetails.push({
  //     key: 'PDU (Probation Delivery Unit)',
  //     lines: [`${officer?.pdu.code || ''} ${officer?.pdu.description || ''}`.trim() || 'Not found'],
  //   })
  //   if (this.userType === 'service-provider') {
  //     probationPractitionerDetails.push({
  //       key: 'Team phone number',
  //       lines: [officer?.team?.telephoneNumber || 'Not found'],
  //     })
  //   }
  //   return probationPractitionerDetails
  // }

  readonly text = {
    title: this.title,
  }
}
