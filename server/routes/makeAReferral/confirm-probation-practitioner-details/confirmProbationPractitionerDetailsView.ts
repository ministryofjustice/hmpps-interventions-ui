import ViewUtils from '../../../utils/viewUtils'
import ConfirmProbationPractitionerDetailsPresenter from './confirmProbationPractitionerDetailsPresenter'
import { InputArgs, RadiosArgs, SelectArgs, SelectArgsItem } from '../../../utils/govukFrontendTypes'

export default class ConfirmProbationPractitionerDetailsView {
  constructor(private readonly presenter: ConfirmProbationPractitionerDetailsPresenter) {}

  private get summaryListArgs() {
    return ViewUtils.summaryListArgs(this.presenter.summary)
  }

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private confirmCorrectDetailsRadiosArgs(noConfirmCorrectDetailsSelectionHTML: string): RadiosArgs {
    return {
      idPrefix: 'confirm-details',
      name: 'confirm-details',
      items: [
        {
          value: 'yes',
          text: 'Yes',
          checked: this.presenter.fields.hasValidDeliusPPDetails === true,
        },
        {
          value: 'no',
          text: 'No',
          checked: this.presenter.fields.hasValidDeliusPPDetails === false,
          conditional: {
            html: noConfirmCorrectDetailsSelectionHTML,
          },
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.confirmDetails.errorMessage),
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

  private get probationPractitionerPduSelectArgs(): SelectArgs {
    const pduItems: SelectArgsItem[] = this.presenter.deliusDeliveryUnits.map(deliveryUnit => ({
      text: deliveryUnit.name,
      value: deliveryUnit.name.toString(),
      selected: this.presenter.fields.probationPractitionerPdu
        ? this.presenter.fields.probationPractitionerPdu === deliveryUnit.name
        : false,
    }))

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a PDU --',
      },
    ]

    items.push(...pduItems)

    return {
      id: 'probation-practitioner-pdu',
      name: 'probation-practitioner-pdu',
      items,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.probationPractitionerPduSelect.errorMessage),
      label: {
        text: this.presenter.text.probationPractitionerPduSelect.label,
      },
      hint: {
        text: this.presenter.text.probationPractitionerPduSelect.hint,
      },
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
      label: {
        text: this.presenter.text.probationPractitionerOfficeSelect.label,
      },
      hint: {
        text: this.presenter.text.probationPractitionerOfficeSelect.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/confirmProbationPractitionerDetails',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        confirmCorrectDetailsRadiosArgs: this.confirmCorrectDetailsRadiosArgs.bind(this),
        probationPractitionerNameInputArgs: this.probationPractitionerNameInputArgs,
        probationPractitionerEmailInputArgs: this.probationPractitionerEmailInputArgs,
        probationPractitionerPduSelectArgs: this.probationPractitionerPduSelectArgs,
        probationPractitionerOfficeSelectArgs: this.probationPractitionerOfficeSelectArgs,
      },
    ]
  }
}
