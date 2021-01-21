/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Explicit return types would make this file very messy and not much more
// informational — everything returned is a string, since they’re messages!

export default {
  startReferral: {
    crnEmpty: 'A CRN is required',
    crnNotFound: 'CRN not found in nDelius',
    unknownError: 'Could not start referral due to service interruption; please try again later',
  },
  completionDeadline: {
    dayEmpty: 'The date by which the service needs to be completed must include a day',
    monthEmpty: 'The date by which the service needs to be completed must include a month',
    yearEmpty: 'The date by which the service needs to be completed must include a year',
    invalidDate: 'The date by which the service needs to be completed must be a real date',
    mustBeInFuture: 'The date by which the service needs to be completed must be in the future',
  },
  complexityLevel: {
    empty: 'Select a complexity level',
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
  usingRarDays: {
    empty: (name: string) => `Select yes if you are using RAR days for the ${name} service`,
  },
  maximumRarDays: {
    empty: (name: string) => `Enter the maximum number of RAR days for the ${name} service`,
    notNumber: (name: string) => `The maximum number of RAR days for the ${name} service must be a number, like 5`,
    notWholeNumber: (name: string) =>
      `The maximum number of RAR days for the ${name} service must be a whole number, like 5`,
  },
}
