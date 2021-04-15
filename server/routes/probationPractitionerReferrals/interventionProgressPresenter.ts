import { ActionPlanAppointment, SentReferral, ServiceCategory } from '../../services/interventionsService'
import utils from '../../utils/utils'
import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from '../shared/referralOverviewPagePresenter'
import { DeliusServiceUser } from '../../services/communityApiService'
import DateUtils from '../../utils/dateUtils'
import sessionStatusTags from '../../utils/sessionStatusTags'

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
      const sessionTableParams = this.sessionTableParams(appointment)

      return {
        sessionNumber: appointment.sessionNumber,
        appointmentTime: DateUtils.formatDateTimeOrEmptyString(appointment.appointmentTime),
        tagArgs: { text: sessionTableParams.text, classes: sessionTableParams.classes },
        linkHtml: sessionTableParams.linkHTML,
      }
    })
  }

  private sessionTableParams(appointment: ActionPlanAppointment): { text: string; classes: string; linkHTML: string } {
    const sessionFeedbackAttendance = appointment.sessionFeedback.attendance

    if (sessionFeedbackAttendance.attended === 'no') {
      return {
        ...sessionStatusTags.didNotAttend,
        linkHTML: `<a class="govuk-link" href="#">View feedback form</a>`,
      }
    }

    if (sessionFeedbackAttendance.attended === 'yes' || sessionFeedbackAttendance.attended === 'late') {
      return {
        ...sessionStatusTags.completed,
        linkHTML: `<a class="govuk-link" href="#">View feedback form</a>`,
      }
    }

    if (appointment.appointmentTime) {
      return {
        ...sessionStatusTags.scheduled,
        linkHTML: '',
      }
    }

    return {
      ...sessionStatusTags.notScheduled,
      linkHTML: '',
    }
  }
}
