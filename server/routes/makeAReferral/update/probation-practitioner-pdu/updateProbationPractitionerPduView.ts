import DeliusDeliveryUnit from '../../../../models/deliusDeliveryUnit'
import { SelectArgs, SelectArgsItem } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import UpdateProbationPractitionerPduPresenter from './updateProbationPractitionerPduPresenter'

export default class UpdateProbationPractitionerPduView {
  constructor(
    private readonly presenter: UpdateProbationPractitionerPduPresenter,
    readonly deliusDeliveryUnits: DeliusDeliveryUnit[]
  ) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get updateProbationPractitionerPduSelectArgs(): SelectArgs {
    const pduItems: SelectArgsItem[] = this.presenter.deliusDeliveryUnits.map(deliveryUnit => ({
      text: deliveryUnit.name,
      value: deliveryUnit.name.toString(),
      selected: this.presenter.fields.ppPdu ? this.presenter.fields.ppPdu === deliveryUnit.name : false,
    }))

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a PDU --',
      },
    ]

    items.push(...pduItems)

    return {
      id: 'delius-probation-practitioner-pdu',
      name: 'delius-probation-practitioner-pdu',
      classes: 'confirm-pdu',
      items,
      label: {
        text: this.presenter.text.inputHeading,
      },
      hint: {
        text: this.presenter.text.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/updateProbationPractitionerPdu',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        updateProbationPractitionerPduSelectArgs: this.updateProbationPractitionerPduSelectArgs,
      },
    ]
  }
}
