import { CheckboxesArgs } from '../../../utils/govukFrontendTypes'
import utils from '../../../utils/utils'
import ViewUtils from '../../../utils/viewUtils'
import UpdateServiceCategoriesPresenter from './updateServiceCategoriesPresenter'

export default class UpdateServiceCategoriesView {
  constructor(private readonly presenter: UpdateServiceCategoriesPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get checkboxArgs(): CheckboxesArgs {
    return {
      classes: 'govuk-checkboxes',
      idPrefix: 'service-category-ids',
      name: 'service-category-ids[]',
      fieldset: {
        legend: {
          text: this.presenter.text.title,
          classes: 'govuk-fieldset__legend--xl',
          isPageHeading: true,
        },
      },
      items: this.presenter.serviceCategories.map(serviceCategory => ({
        value: serviceCategory.id,
        text: utils.convertToProperCase(serviceCategory.name),
        checked: this.presenter.hasSelectedServiceCategory(serviceCategory.id),
      })),
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/updateServiceCategories',
      {
        presenter: this.presenter,
        checkboxArgs: this.checkboxArgs,
        errorSummaryArgs: this.errorSummaryArgs,
      },
    ]
  }
}
