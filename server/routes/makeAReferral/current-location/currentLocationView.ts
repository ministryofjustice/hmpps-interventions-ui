import ViewUtils from '../../../utils/viewUtils'
import { RadiosArgs, SelectArgs, SelectArgsItem } from '../../../utils/govukFrontendTypes'
import CurrentLocationPresenter from './currentLocationPresenter'
import { CurrentLocationType } from '../../../models/draftReferral'

export default class CurrentLocationView {
  constructor(private readonly presenter: CurrentLocationPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private submitLocationRadiosArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'current-location',
      name: 'current-location',
      fieldset: {
        legend: {
          text: this.presenter.text.currentLocation.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      items: [
        {
          value: CurrentLocationType.custody.toString(),
          text: this.presenter.text.currentLocation.custodyLabel,
          checked: this.presenter.fields.currentLocation === CurrentLocationType.custody.toString(),
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: CurrentLocationType.community.toString(),
          text: this.presenter.text.currentLocation.communityLabel,
          checked: this.presenter.fields.currentLocation === CurrentLocationType.community.toString(),
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.currentLocation.errorMessage),
    }
  }

  private get prisonSelectArgs(): SelectArgs {
    const prisonItems = this.presenter.prisons.map(prison => {
      return {
        text: prison.prisonName,
        value: prison.prisonId,
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
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.submitLocationInput.errorMessage),
      label: {
        text: this.presenter.text.submitLocationInput.label,
      },
      hint: {
        text: this.presenter.text.submitLocationInput.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/submitLocation',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        submitLocationRadiosArgs: this.submitLocationRadiosArgs.bind(this),
        warningText: this.presenter.text.warningText,
        prisonSelectArgs: this.prisonSelectArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}
