import { SessionStatus } from '../../utils/sessionStatus'

export default class SessionStatusPresenter {
  constructor(private readonly status: SessionStatus) {}

  get text(): string {
    switch (this.status) {
      case SessionStatus.didNotAttend:
        return 'did not attend'
      case SessionStatus.scheduled:
        return 'scheduled'
      case SessionStatus.awaitingFeedback:
        return 'needs feedback'
      case SessionStatus.completed:
        return 'completed'
      case SessionStatus.didNotHappen:
        return 'did not happen'
      case SessionStatus.rescheduled:
        return 'rescheduled'
      default:
        return 'not scheduled'
    }
  }

  get tagClass(): string {
    switch (this.status) {
      case SessionStatus.didNotAttend:
        return 'govuk-tag--purple'
      case SessionStatus.scheduled:
        return 'govuk-tag--blue'
      case SessionStatus.awaitingFeedback:
        return 'govuk-tag--red'
      case SessionStatus.completed:
        return 'govuk-tag--green'
      case SessionStatus.didNotHappen:
        return 'govuk-tag--yellow'
      case SessionStatus.rescheduled:
        return 'govuk-tag--grey'
      default:
        return 'govuk-tag--grey'
    }
  }
}
