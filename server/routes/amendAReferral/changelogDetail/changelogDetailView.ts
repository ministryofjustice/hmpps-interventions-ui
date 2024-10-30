import moment from 'moment-timezone'
import { TagArgs } from '../../../utils/govukFrontendTypes'
import ViewUtils from '../../../utils/viewUtils'
import ChangelogDetailPresenter from './changelogDetailPresenter'

export default class ChangelogDetailView {
  constructor(readonly presenter: ChangelogDetailPresenter) {}

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.backUrl,
  }

  renderBasedonTopic(tagMacro: (args: TagArgs) => string) {
    const { oldValue } = this.presenter.changelogDetail
    const { newValue } = this.presenter.changelogDetail
    switch (this.presenter.changelogDetail.topic) {
      case 'COMPLEXITY_LEVEL':
        return {
          from: `
          ${ViewUtils.changelogDetailTagHtml(
            oldValue[0].trim(),
            this.findColourForComplexityLevel(oldValue[0].trim()),
            args => tagMacro({ ...args, attributes: { ...(args.attributes ?? {}) } })
          )}`,
          to: `
          ${ViewUtils.changelogDetailTagHtml(
            newValue[0].trim(),
            this.findColourForComplexityLevel(newValue[0].trim()),
            args => tagMacro({ ...args, attributes: { ...(args.attributes ?? {}) } })
          )}`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'DESIRED_OUTCOMES':
        return {
          from: this.generateDesiredOutcomeList(oldValue),
          to: this.generateDesiredOutcomeList(newValue),
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'MAXIMUM_ENFORCEABLE_DAYS':
        return {
          from: `<p>${oldValue[0].trim()} days</p>`,
          to: `<p>${newValue[0].trim()} days</p>`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'COMPLETION_DATETIME':
        return {
          from: `<p>${oldValue[0].trim()}</p>`,
          to: `<p>${newValue[0].trim()}</p>`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'NEEDS_AND_REQUIREMENTS_ACCESSIBILITY_NEEDS':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'NEEDS_AND_REQUIREMENTS_ADDITIONAL_INFORMATION':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'NEEDS_AND_REQUIREMENTS_INTERPRETER_REQUIRED':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'NEEDS_AND_REQUIREMENTS_HAS_ADDITIONAL_RESPONSIBILITIES':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'REASON_FOR_REFERRAL':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
        }
      case 'REASON_FOR_REFERRAL_FURTHER_INFORMATION':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
        }
      case 'PRISON_ESTABLISHMENT':
        return {
          from: `<p>${oldValue[0].length > 0 ? this.getPrisonName(oldValue[0].trim()) : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? this.getPrisonName(newValue[0].trim()) : 'N/A'}</p>`,
          reason: this.presenter.changelogDetail.reasonForChange,
        }
      case 'EXPECTED_RELEASE_DATE':
        return this.determineExpectedReleaseDate(oldValue, newValue)
      case 'EXPECTED_PROBATION_OFFICE':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
        }
      case 'PROBATION_PRACTITIONER_PROBATION_OFFICE':
        return {
          from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
          to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
        }
      case 'PROBATION_PRACTITIONER_NAME':
        return {
          from: `<p>${oldValue.length > 0 ? oldValue : 'N/A'}</p>`,
          to: `<p>${newValue.length > 0 ? newValue : 'N/A'}</p>`,
        }
      case 'PROBATION_PRACTITIONER_EMAIL':
        return {
          from: `<p>${oldValue.length > 0 ? oldValue : 'N/A'}</p>`,
          to: `<p>${newValue.length > 0 ? newValue : 'N/A'}</p>`,
        }
      case 'PROBATION_PRACTITIONER_PHONE_NUMBER':
        return {
          from: `<p>${oldValue.length > 0 ? oldValue : 'N/A'}</p>`,
          to: `<p>${newValue.length > 0 ? newValue : 'N/A'}</p>`,
        }
      default:
        return {}
    }
  }

  generateDesiredOutcomeList(values: string[]): string {
    return `<ul class="govuk-list govuk-list--bullet">${values
      .map(it => {
        return `<li>${it}</li>`
      })
      .join('')} </ul>`
  }

  findColourForComplexityLevel(value: string): string {
    if (value === 'LOW COMPLEXITY') {
      return 'govuk-tag--green'
    }
    if (value === 'MEDIUM COMPLEXITY') {
      return 'govuk-tag--blue'
    }
    return 'govuk-tag--red'
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/changelogDetail',
      {
        presenter: this.presenter,
        backlinkArgs: this.backLinkArgs,
        renderBasedonTopicArgs: this.renderBasedonTopic.bind(this),
      },
    ]
  }

  private getPrisonName(prisonId: string | null): string {
    return (
      this.presenter.prisonAndSecuredChildAgency.find(
        prisonAndSecuredChildAgency => prisonAndSecuredChildAgency.id === prisonId
      )?.description || ''
    )
  }

  private determineExpectedReleaseDateValue(expectedReleaseDateString: string): string {
    const dateString = moment(expectedReleaseDateString)
    if (dateString.isValid()) {
      return moment(expectedReleaseDateString).format('DD MMM YYYY')
    }
    return expectedReleaseDateString
  }

  private determineExpectedReleaseDate(oldValue: string[], newValue: string[]) {
    const oldValueDateString = moment(oldValue[0].trim())
    const newValueDateString = moment(newValue[0].trim())
    if (oldValueDateString.isValid() || newValueDateString.isValid()) {
      return {
        from: `<p>${oldValue[0].length > 0 ? this.determineExpectedReleaseDateValue(oldValue[0].trim()) : 'N/A'}</p>`,
        to: `<p>${newValue[0].length > 0 ? this.determineExpectedReleaseDateValue(newValue[0].trim()) : 'N/A'}</p>`,
        fromTitle: `${!oldValueDateString.isValid() ? 'Expected release date is not known.' : ''}`,
        toTitle: `${!newValueDateString.isValid() ? 'Expected release date is not known.' : ''}`,
      }
    }
    return {
      from: `<p>${oldValue[0].length > 0 ? oldValue[0].trim() : 'N/A'}</p>`,
      to: `<p>${newValue[0].length > 0 ? newValue[0].trim() : 'N/A'}</p>`,
      fromTitle: 'Expected release date is not known.',
      toTitle: 'Expected release date is not known.',
    }
  }
}
