import SentReferral from '../../../models/sentReferral'
import ServiceCategory from '../../../models/serviceCategory'
import utils from '../../../utils/utils'

interface EndOfServiceReportFormPagePresenter {
  text: {
    title: string
    pageNumber: string
    numberOfPages: string
  }
}

export default class EndOfServiceReportFormPresenter {
  constructor(private readonly serviceCategory: ServiceCategory, private readonly referral: SentReferral) {}

  private get numberOfDesiredOutcomes(): number {
    return this.referral.referral.desiredOutcomes.flatMap(desiredOutcome => desiredOutcome.desiredOutcomesIds).length
  }

  private get title(): string {
    return `${utils.convertToProperCase(this.serviceCategory.name)}: End of service report`
  }

  private get numberOfPages(): string {
    return String(this.numberOfDesiredOutcomes + 2)
  }

  desiredOutcomePage(desiredOutcomeNumber: number): EndOfServiceReportFormPagePresenter {
    return { text: { title: this.title, pageNumber: String(desiredOutcomeNumber), numberOfPages: this.numberOfPages } }
  }

  get furtherInformationPage(): EndOfServiceReportFormPagePresenter {
    return {
      text: {
        title: this.title,
        pageNumber: String(this.numberOfDesiredOutcomes + 1),
        numberOfPages: this.numberOfPages,
      },
    }
  }

  get checkAnswersPage(): EndOfServiceReportFormPagePresenter {
    return { text: { title: this.title, pageNumber: this.numberOfPages, numberOfPages: this.numberOfPages } }
  }
}
