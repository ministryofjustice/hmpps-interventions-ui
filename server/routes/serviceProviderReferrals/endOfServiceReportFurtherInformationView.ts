import { TextareaArgs } from '../../utils/govukFrontendTypes'
import EndOfServiceReportFurtherInformationPresenter from './endOfServiceReportFurtherInformationPresenter'

export default class EndOfServiceReportFurtherInformationView {
  constructor(private readonly presenter: EndOfServiceReportFurtherInformationPresenter) {}

  private readonly furtherInformationTextareaArgs: TextareaArgs = {
    id: 'further-information',
    name: 'further-information',
    value: this.presenter.fields.furtherInformation.value,
    label: {
      text: 'Provide any further information that you believe is important for the probation practitioner to know.',
    },
  }

  readonly renderArgs: [string, Record<string, unknown>] = [
    'serviceProviderReferrals/endOfServiceReport/furtherInformation',
    {
      presenter: this.presenter,
      furtherInformationTextareaArgs: this.furtherInformationTextareaArgs,
    },
  ]
}
