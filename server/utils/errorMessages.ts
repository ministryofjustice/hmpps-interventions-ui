/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Explicit return types would make this file very messy and not much more
// informational — everything returned is a string, since they’re messages!

export default {
  completionDeadline: {
    dayEmpty: 'The date by which the service needs to be completed must include a day',
    monthEmpty: 'The date by which the service needs to be completed must include a month',
    yearEmpty: 'The date by which the service needs to be completed must include a year',
    invalidDate: 'The date by which the service needs to be completed must be a real date',
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
}
