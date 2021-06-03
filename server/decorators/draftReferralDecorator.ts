import DraftReferral from '../models/draftReferral'
import ServiceCategory from '../models/serviceCategory'
import CalendarDay from '../utils/calendarDay'

export default class DraftReferralDecorator {
  constructor(private readonly referral: DraftReferral) {}

  referralServiceCategories(allServiceCategories: ServiceCategory[]): ServiceCategory[] {
    if (this.referral.serviceCategoryIds === null) {
      throw new Error(`Service categories not selected`)
    }

    return this.referral.serviceCategoryIds.map(id => {
      const serviceCategory = allServiceCategories.find(val => val.id === id)
      if (serviceCategory === undefined) {
        throw new Error(`Service category not found for ID ${id}`)
      }
      return serviceCategory
    })
  }

  get completionDeadline(): CalendarDay | null {
    if (this.referral.completionDeadline === null) {
      return null
    }

    const day = CalendarDay.parseIso8601Date(this.referral.completionDeadline)

    if (day === null) {
      throw new Error('Failed to parse completion deadline')
    }

    return day
  }
}
