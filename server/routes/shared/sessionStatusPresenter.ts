import { SessionStatus } from '../../utils/sessionStatus'

export default class SessionStatusPresenter {
  constructor(private readonly status: SessionStatus) {}

  get text(): string {
    switch (this.status) {
      case SessionStatus.didNotAttend:
        return 'did not attend'
      case SessionStatus.scheduled:
        return 'scheduled'
      case SessionStatus.completed:
        return 'completed'
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
      case SessionStatus.completed:
        return 'govuk-tag--green'
      default:
        return 'govuk-tag--grey'
    }
  }
}
