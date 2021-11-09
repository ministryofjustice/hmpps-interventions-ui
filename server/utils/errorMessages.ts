/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Explicit return types would make this file very messy and not much more
// informational — everything returned is a string, since they’re messages!

export default {
  startReferral: {
    crnEmpty: 'A CRN is needed',
    crnNotFound: 'CRN not found in nDelius',
    unknownError: 'Could not start referral due to service interruption; please try again later',
  },
  riskInformation: {
    empty: 'Enter risk information',
    tooLong: 'Risk information must be 4000 characters or fewer',
  },
  completionDeadline: {
    dayEmpty: 'The date by which the service needs to be completed must include a day',
    monthEmpty: 'The date by which the service needs to be completed must include a month',
    yearEmpty: 'The date by which the service needs to be completed must include a year',
    invalidDate: 'The date by which the service needs to be completed must be a real date',
    mustBeInFuture: 'The date by which the service needs to be completed must be in the future',
  },
  reportingDate: {
    from: {
      dayEmpty: 'The "from" date must include a day',
      monthEmpty: 'The "from" date must include a month',
      yearEmpty: 'The "from" date must include a year',
      invalidDate: 'The "from" date must be a real date',
      mustBeAfterDayOne: 'Data before 01 June 2021 is not available',
      mustBeBeforeToDate: 'The "from" date must be before the "to" date',
      mustNotBeInFuture: `Data after today is not available`,
    },
    to: {
      dayEmpty: 'The "to" date must include a day',
      monthEmpty: 'The "to" date must include a month',
      yearEmpty: 'The "to" date must include a year',
      invalidDate: 'The "to" date must be a real date',
      mustNotBeInFuture: `Data after today is not available`,
    },
  },
  serviceCategories: {
    empty: 'At least one service category must be selected',
  },
  complexityLevel: {
    empty: 'Select a complexity level',
  },
  relevantSentence: {
    empty: 'Select the relevant sentence',
  },
  desiredOutcomes: {
    empty: 'Select desired outcomes',
  },
  needsInterpreter: {
    empty: (name: string) => `Select yes if ${name} needs an interpreter`,
  },
  interpreterLanguage: {
    empty: (name: string) => `Enter the language for which ${name} needs an interpreter`,
  },
  hasAdditionalResponsibilities: {
    empty: (name: string) => `Select yes if ${name} has caring or employment responsibilities`,
  },
  whenUnavailable: {
    empty: (name: string) => `Enter details of when ${name} will not be able to attend sessions`,
  },
  maximumEnforceableDays: {
    empty: 'Enter the maximum number of enforceable days',
    notNumber: 'The maximum number of enforceable days must be a number, like 5',
    notWholeNumber: 'The maximum number of enforceable days must be a whole number, like 5',
    tooSmall: 'The maximum number of enforceable days must be at least 1',
  },
  assignReferral: {
    emailEmpty: 'An email address is required',
    emailNotFound: 'Email address not found',
    unknownError: 'Could not find email address due to service interruption; please try again later',
  },
  actionPlanActivity: {
    empty: 'Enter an activity',
    noneAdded: 'You must add at least one activity',
  },
  actionPlanNumberOfSessions: {
    empty: 'Enter the number of sessions',
    notNumber: 'The number of sessions must be a number, like 5',
    notWholeNumber: 'The number of sessions must be a whole number, like 5',
    tooSmall: 'The number of sessions must be 1 or more',
    cannotBeReduced: 'You cannot reduce the number of sessions for a previously-approved action plan.',
  },
  actionPlanApproval: {
    notConfirmed: 'Select the checkbox to confirm before you approve the action plan',
  },
  attendedAppointment: {
    empty: 'Select whether the service user attended or not',
  },
  appointmentBehaviour: {
    descriptionEmpty: "Enter a description of the service user's behaviour",
    notifyProbationPractitionerNotSelected: 'Select whether to notify the probation practitioner or not',
  },
  scheduleAppointment: {
    time: {
      calendarDay: {
        dayEmpty: 'The session date must include a day',
        monthEmpty: 'The session date must include a month',
        yearEmpty: 'The session date must include a year',
        invalidDate: 'The session date must be a real date',
      },
      clockTime: {
        hourEmpty: 'The session time must include an hour',
        minuteEmpty: 'The session time must include a minute',
        partOfDayEmpty: 'Select whether the session time is AM or PM',
        invalidTime: 'The session time must be a real time',
      },
      invalidTime: 'The session time must exist on the session date',
    },
    duration: {
      empty: 'Enter a duration',
      invalidDuration: 'The session duration must be a real duration',
    },
    sessionType: {
      empty: 'Select the session type',
    },
    meetingMethod: {
      empty: 'Select a meeting method',
    },
    address: {
      addressLine1Empty: 'Enter a value for address line 1',
      townOrCityEmpty: 'Enter a town or city',
      countyEmpty: 'Enter a county',
      postCodeEmpty: 'Enter a postcode',
      postCodeInvalid: 'Enter a valid postcode',
    },
    deliusOfficeLocation: {
      empty: 'Select an office',
      invalidOfficeSelection: 'Select an office from the list',
    },
  },
  endOfServiceReportOutcome: {
    achievementLevel: {
      empty: (name: string) => `Select whether ${name} achieved the desired outcome`,
    },
  },
  cancelReferral: {
    cancellationReason: {
      empty: 'Select a reason for cancelling the referral',
    },
  },
  caseNote: {
    subject: {
      empty: 'Enter a subject for your case note',
    },
    body: {
      empty: 'Enter some details about your case note',
    },
  },
  oasysRiskInformation: {
    edit: {
      empty: 'Select Yes if you want to edit this OASys risk information',
    },
    confirmUnderstood: {
      notSelected:
        'You must confirm that you understand that this information will be shared with the Service Provider',
    },
  },
}
