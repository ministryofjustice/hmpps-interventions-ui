import errorMessages from './errorMessages'

export default {
  completionDeadline: {
    DATE_MUST_BE_IN_THE_FUTURE: errorMessages.completionDeadline.mustBeInFuture,
  },
  numberOfSessions: {
    CANNOT_BE_REDUCED: errorMessages.actionPlanNumberOfSessions.cannotBeReduced,
  },
}
