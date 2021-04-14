import { ActionPlanAppointment, SentReferral, ServiceCategory } from '../../services/interventionsService'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import { DeliusServiceUser } from '../../services/communityApiService'
import DateUtils from '../../utils/dateUtils'

export default class InterventionProgressPresenter {
  referralOverviewPagePresenter: ReferralOverviewPagePresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    serviceUser: DeliusServiceUser,
    private readonly actionPlanAppointments: ActionPlanAppointment[]
  ) {
    this.referralOverviewPagePresenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Progress,
      referral,
      serviceUser,
      'probation-practitioner'
    )
  }

  get referralAssigned(): boolean {
    return this.referral.assignedTo !== null
  }

  readonly text = {
    title: `${utils.convertToTitleCase(this.serviceCategory.name)} progress`,
  }

  readonly hasSessions = this.actionPlanAppointments.length !== 0

  readonly sessionTableHeaders = ['Session details', 'Date and time', 'Status', 'Action']

  get sessionTableRows(): Record<string, unknown>[] {
    if (!this.hasSessions) {
      return []
    }

    return this.actionPlanAppointments.map(appointment => {
      return {
        sessionNumber: appointment.sessionNumber,
        appointmentTime: DateUtils.formatDateTimeOrEmptyString(appointment.appointmentTime),
        tagArgs: this.tagArgs(appointment),
        linkHtml: appointment.sessionFeedback?.submitted ? `<a class="govuk-link" href="#">View</a>` : '',
      }
    })
  }

  private tagArgs(appointment: ActionPlanAppointment): Record<string, unknown> {
    const sessionFeedbackAttendance = appointment.sessionFeedback?.attendance

    if (sessionFeedbackAttendance?.attended === 'no') {
      return { text: 'FAILURE TO ATTEND', classes: 'govuk-tag--purple' }
    }

    if (sessionFeedbackAttendance?.attended === 'yes' || sessionFeedbackAttendance?.attended === 'late') {
      return { text: 'COMPLETED', classes: 'govuk-tag--green' }
    }

    if (appointment.appointmentTime) {
      return { text: 'SCHEDULED', classes: 'govuk-tag--blue' }
    }

    return { text: 'NOT SCHEDULED', classes: 'govuk-tag--grey' }
  }
}
