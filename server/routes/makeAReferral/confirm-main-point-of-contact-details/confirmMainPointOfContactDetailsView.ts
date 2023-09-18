import ViewUtils from '../../../utils/viewUtils'
import ConfirmMainPointOfContactDetailsPresenter from './confirmMainPointOfContactDetailsPresenter'
import { InputArgs, RadiosArgs, SelectArgs, SelectArgsItem } from '../../../utils/govukFrontendTypes'

export default class ConfirmMainPointOfContactDetailsView {
  constructor(private readonly presenter: ConfirmMainPointOfContactDetailsPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private confirmCorrectDetailsRadiosArgs(
    establishmentSelectionHTML: string,
    probationOfficeSelectionHTML: string
  ): RadiosArgs {
    return {
      idPrefix: 'location',
      name: 'location',
      items: [
        {
          value: 'establishment',
          text: 'Establishment',
          checked:
            this.presenter.fields.probationPractitionerPdu !== null &&
            this.presenter.fields.probationPractitionerPdu !== '',
          conditional: {
            html: establishmentSelectionHTML,
          },
        },
        {
          value: 'probation office',
          text: 'Probation office',
          checked:
            this.presenter.fields.probationPractitionerOffice !== null &&
            this.presenter.fields.probationPractitionerOffice !== '',

          conditional: {
            html: probationOfficeSelectionHTML,
          },
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.location.errorMessage),
    }
  }

  private get probationPractitionerNameInputArgs(): InputArgs {
    return {
      id: 'probation-practitioner-name',
      name: 'probation-practitioner-name',
      classes: 'govuk-input--width-20',
      label: {
        text: this.presenter.text.probationPractitionerName.label,
      },
      value: this.presenter.fields.probationPractitionerName,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.probationPractitionerName.errorMessage),
    }
  }

  private get probationPractitionerEmailInputArgs(): InputArgs {
    return {
      id: 'probation-practitioner-email',
      name: 'probation-practitioner-email',
      classes: 'govuk-input--width-20',
      label: {
        text: this.presenter.text.probationPractitionerEmail.label,
      },
      value: this.presenter.fields.probationPractitionerEmail,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.probationPractitionerEmail.errorMessage),
    }
  }

  private get probationPractitionerRoleOrJobTitleInputArgs(): InputArgs {
    return {
      id: 'probation-practitioner-roleOrJobTitle',
      name: 'probation-practitioner-roleOrJobTitle',
      classes: 'govuk-input--width-20',
      label: {
        text: this.presenter.text.probationRoleOrJobTitle.label,
      },
      value: this.presenter.fields.probationPractitionerRoleOrJobTitle,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.probationRoleOrJobTitle.errorMessage),
    }
  }

  private get probationPractitionerOfficeSelectArgs(): SelectArgs {
    const officeLocationItems: SelectArgsItem[] = this.presenter.deliusOfficeLocations.map(officeLocation => ({
      text: officeLocation.name,
      value: officeLocation.name.toString(),
      selected: this.presenter.fields.probationPractitionerOffice
        ? this.presenter.fields.probationPractitionerOffice === officeLocation.name
        : false,
    }))

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a Probation Office --',
      },
    ]

    items.push(...officeLocationItems)

    return {
      id: 'probation-practitioner-office',
      name: 'probation-practitioner-office',
      items,
      hint: {
        text: this.presenter.text.probationPractitionerOfficeSelect.hint,
      },
    }
  }

  private get prisonSelectArgs(): SelectArgs {
    const prisonItems = this.presenter.prisons.map(prison => {
      return {
        text: prison.prisonName,
        value: prison.prisonId,
        selected: this.presenter.referral.personCustodyPrisonId
          ? this.presenter.referral.personCustodyPrisonId === prison.prisonId
          : false,
      }
    })

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a Prison Location --',
      },
    ]

    items.push(...prisonItems)

    return {
      id: 'prison-select',
      name: 'prison-select',
      items,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.probationPractitionerPduSelect.errorMessage),
      hint: {
        text: this.presenter.text.probationPractitionerOfficeSelect.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/confirmMainPointOfContactDetails',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        confirmCorrectDetailsRadiosArgs: this.confirmCorrectDetailsRadiosArgs.bind(this),
        probationPractitionerNameInputArgs: this.probationPractitionerNameInputArgs,
        probationPractitionerEmailInputArgs: this.probationPractitionerEmailInputArgs,
        prisonSelectArgs: this.prisonSelectArgs,
        probationPractitionerRoleOrJobTitleInputArgs: this.probationPractitionerRoleOrJobTitleInputArgs,
        probationPractitionerOfficeSelectArgs: this.probationPractitionerOfficeSelectArgs,
        suppressServiceUserBanner: true,
      },
    ]
  }
}