/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Explicit return types would make this file very messy and not much more
// informational — everything returned is a string, since they’re messages!

const errorHandlerAccessErrorMessages = {
  notSetUpCorrectly:
    'Your account is not set up correctly. Ask an admin user in your organisation to fix this in HMPPS Digital Services.',
  notSetUpCorrectlyCRS:
    'Your account is not set up correctly. Ask an admin user in your organisation to add the ‘CRS provider’ role in HMPPS Digital Services.',
  emailNotRecognised:
    'Your email address is not recognised. If it has changed recently, try signing out and signing in with the correct one. Ask an admin user in your organisation to check what the right email is in HMPPS Digital Services. If that does not work, <a target="_blank" href="/report-a-problem">report it as a problem.</a>',
  providerGroupNotRecognised:
    'Your provider group is not recognised. Ask an admin in your organisation to check it has been set up correctly in HMPPS Digital Services. They may need to <a target="_blank" href="/report-a-problem">report it as a problem.</a>',
  contractGroupNotRecognised:
    'Your contract group is not recognised. Ask an admin in your organisation to check it has been set up correctly in HMPPS Digital Services. They may need to <a target="_blank" href="/report-a-problem">report it as a problem.</a>',
  groupsDoNotMatch:
    'The contract and supplier groups on your account do not match. Ask an admin user in your organisation to fix this in HMPPS Digital Services.',
  noContactGroups:
    'You do not have any contract groups on your account. Ask an admin in your organisation to set this up in HMPPS Digital Services.',
  noServiceGroups:
    'You do not have any supplier groups on your account. Ask an admin in your organisation to set this up in HMPPS Digital Services.',
}

const userHeaderTypes = {
  userHeaderService: 'You do not have permission to view this service',
  userHeaderPage: 'You do not have permission to view this page',
  default: 'Sorry, you are not authorised to access this page',
}

const returnedError = {
  'could not map service provider user to access scope': {
    mappedMessage: errorHandlerAccessErrorMessages.notSetUpCorrectly,
    userHeaderType: userHeaderTypes.userHeaderService,
  },
  'user is not a service provider': {
    mappedMessage: errorHandlerAccessErrorMessages.notSetUpCorrectlyCRS,
    userHeaderType: userHeaderTypes.userHeaderPage,
  },
  'cannot find user in hmpps auth': {
    mappedMessage: errorHandlerAccessErrorMessages.emailNotRecognised,
    userHeaderType: userHeaderTypes.userHeaderPage,
  },
  'no valid contract groups associated with user': {
    mappedMessage: errorHandlerAccessErrorMessages.noContactGroups,
    userHeaderType: userHeaderTypes.userHeaderService,
  },
  'no valid service provider groups associated with user': {
    mappedMessage: errorHandlerAccessErrorMessages.noServiceGroups,
    userHeaderType: userHeaderTypes.userHeaderService,
  },
}

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
  releaseDate: {
    dayEmpty: 'Enter the expected release date',
    monthEmpty: 'Enter the expected release date',
    yearEmpty: 'Enter the expected release date',
    invalidDate: 'Enter date in the correct format',
    mustBeInFuture: 'Enter date in the future',
  },
  reasonForChange: {
    cannotBeEmpty: 'Reason for change cannot be empty',
  },
  reportingDate: {
    from: {
      dayEmpty: "The 'from' date must include a day",
      monthEmpty: "The 'from' date must include a month",
      yearEmpty: "The 'from' date must include a year",
      invalidDate: "The 'from' date must be a real date",
      mustBeAfterDayOne: 'Data before 01 June 2021 is not available',
      mustBeBeforeToDate: "Enter a date that is before or the same as the 'date to'",
      mustNotBeInFuture: 'Data after today is not available',
      mustNotMoreThan6Months: "Enter a date that is within 6 months of the 'date to'",
    },
    to: {
      dayEmpty: "The 'to' date must include a day",
      monthEmpty: "The 'to' date must include a month",
      yearEmpty: "The 'to' date must include a year",
      invalidDate: "The 'to' date must be a real date",
      mustBeAfterFromDate: "Enter a date that is later than or the same as the 'date from'",
      mustNotBeInFuture: 'Data after today is not available',
      mustNotMoreThan6Months: "Enter a date that is within 6 months of the 'date from'",
    },
  },
  serviceCategories: {
    empty: 'At least one service category must be selected',
  },
  complexityLevel: {
    empty: 'Select a complexity level',
  },
  employmentResponsibilities: {
    whenUnavailable: {
      empty: 'Details of unavailability must be provided',
    },
  },
  relevantSentence: {
    empty: 'Select the relevant sentence',
  },
  desiredOutcomes: {
    empty: 'Select desired outcomes',
    noChanges: 'You have not changed any desired outcomes.',
  },
  accessibilityneeds: {
    noChanges: 'You have not changed the accessibility needs',
  },
  additionalInformation: {
    noChanges: 'You have not changed any additional information.',
  },
  needsInterpreter: {
    empty: (name: string) => `Select yes if ${name} needs an interpreter`,
  },
  interpreterLanguage: {
    empty: (name: string) => `Enter the language for which ${name} needs an interpreter`,
  },
  currentLocation: {
    emptyRadio: 'Select yes or no',
    empty: `Select a prison establishment from the list`,
  },
  custodyLocation: {
    emptyRadio: 'Select custody or community',
    empty: (name: string) => `You must enter the establishment ${name} is currently in`,
  },
  prisonRelease: {
    emptyRadio: 'Select yes or no',
  },
  communityAllocated: {
    emptyRadio: 'Select yes or no',
  },
  confirmProbationPractitionerDetails: {
    emptyName: `Add probation practitioner name - this is a mandatory field`,
    emptyPdu: `Add PDU (Probation Delivery Unit) - this is a mandatory field`,
  },
  updateProbationPractitionerDetails: {
    emptyName: `Enter name of probation practitioner`,
    emptyEmail: `Enter email address`,
    invalidEmail: `Enter email address in the correct format`,
    invalidPhoneNumber: 'Enter numbers only',
  },
  confirmMainPointOfContactDetails: {
    emptyRadio: 'Select prison establishment or probation office',
    emptyName: `Add main point of contact name - this is a mandatory field`,
    emptyPrisonName: `Select a prison establishment from the list`,
    emptyRoleOrJobTitle: `Add role / job title - this is a mandatory field`,
    emptyProbationOffice: `Enter a probation office`,
    emptyEmail: `Add email address - this is a mandatory field`,
    invalidEmail: `Enter email address in the correct format`,
    invalidPhoneNumber: `Enter phone number in the correct format`,
  },
  interpreterLanguageWithoutName: {
    empty: 'Enter the language for interpretation',
  },
  needsInterpreterWithoutName: {
    empty: `Select yes if there is a need for an interpreter`,
    noChanges: 'You have no changes to whether an interpreter is needed.',
  },
  expectedReleaseDate: {
    empty: 'Select the expected release date or choose a different date',
    emptyRadioButton: 'Select an option',
    emptyReason: 'Enter a reason',
    noChangesinExpectedReleaseDate: 'Enter a different expected release date',
    noChangesinExpectedReleaseDateMissingReason: 'Enter a different expected release date unknown reason',
  },
  releaseDateUnknownReason: {
    empty: `Enter a reason why the expected release date is not known`,
  },
  probationOffice: {
    empty: `Enter a probation office`,
  },
  probationOfficeUnknownReason: {
    empty: `Enter a reason why the expected probation office is not known`,
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
  reviewActionPlan: {
    supplierAssessmentAppointmentIncomplete:
      'You cannot submit an action plan yet. First you need to hold the supplier assessment appointment and then give feedback on it.',
  },
  didSessionHappen: {
    empty: 'Select whether the session happened',
  },
  attendedAppointment: {
    empty: 'Select whether they attended or not',
  },
  attendanceFailureInformation: {
    empty: 'Enter how you tried to contact them and anything you know about why they did not attend',
  },
  sessionSummary: {
    empty: (isInitialAppointment: boolean) =>
      `Enter what you did in the ${isInitialAppointment ? 'appointment' : 'session'}`,
  },
  sessionResponse: {
    empty: (name: string, isInitialAppointment: boolean) =>
      `Enter how ${name} responded to the ${isInitialAppointment ? 'appointment' : 'session'}`,
  },
  sessionConcerns: {
    empty: 'Enter a description of what concerned you',
  },
  sessionBehaviour: {
    empty: (name: string) => `Enter details about ${name}'s poor behaviour`,
  },
  notifyProbationPractitioner: {
    notSelected: "Select 'no' if the probation practitioner does not need to be notified",
  },
  late: {
    optionNotSelected: (name: string) => `Select whether ${name} was late`,
  },
  lateReason: {
    empty: 'Add anything you know about the lateness',
  },
  noReasonType: {
    empty: 'Select why the session did not happen',
    popAcceptable: {
      empty: 'Enter what happened and who was involved',
    },
    popUnacceptable: {
      empty: 'Enter details about why they were not able to take part',
    },
    logistics: {
      empty: 'Enter details about the service provider or logistics issue',
    },
  },
  noAttendanceInformation: {
    empty: 'Add anything you know about them not attending',
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
      pastTime: 'The session cannot be scheduled in the past',
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
    rescheduleRequestedBy: {
      emptyRadio: (formType: string | null) =>
        `Select who requested the ${formType === 'supplierAssessment' ? 'appointment' : 'session'} change`,
    },
    rescheduledReason: {
      empty: (formType: string | null) =>
        `Enter reason for changing ${formType === 'supplierAssessment' ? 'appointment' : 'session'}`,
    },
  },
  endOfServiceReportOutcome: {
    achievementLevel: {
      empty: (name: string) => `Select whether ${name} achieved the desired outcome`,
    },
    progressionComments: {
      empty: () => `Add what progress they made`,
    },
  },
  cancelReferral: {
    cancellationReason: {
      empty: 'Select a reason for cancelling the referral',
    },
  },
  withdrawReferral: {
    withdrawalReason: {
      empty: 'Select a reason for withdrawing the referral',
    },
    withdrawalComments: {
      empty: 'Enter details about why this reason was selected',
    },
  },
  reasonForReferral: {
    empty: 'Enter reason for the referral and referral details',
  },
  reasonForReferralFurtherInformation: {
    empty: 'Enter any further information',
  },
  probationPractitionerName: {
    empty: 'Enter probation practitioner name',
    unchanged: 'Probation practitioner name must have changed',
  },
  probationPractitionerEmail: {
    empty: 'Enter probation practitioner email address',
    unchanged: 'Probation practitioner email address must have changed',
    invalidEmail: `Enter email address in the correct format`,
  },
  prisonEstablishment: {
    empty: 'Enter a prison establishment',
    emptyReason: 'Enter a reason',
  },

  caseNote: {
    subject: {
      empty: 'Enter a subject for your case note',
    },
    body: {
      empty: 'Enter some details about your case note',
    },
    sendCaseNoteEmail: {
      empty: 'Select yes if you want the probation practitioner to get an email about this case note',
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
  amendReferralFields: {
    missingReason: 'A reason for changing the referral must be supplied',
  },
  returnedError,
  userHeaderTypes,
  errorHandlerAccessErrorMessages,
}
