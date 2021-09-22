import { PrimaryNavItem } from '../../utils/viewUtils'
import config from '../../config'

export default class DashboardNavPresenter {
  constructor(private readonly active: string) {}

  get items(): PrimaryNavItem[] {
    const items = [
      {
        text: 'All cases',
        href: '/service-provider/dashboard',
        active: this.active === 'All cases',
      },
    ]

    if (config.features.serviceProviderReporting) {
      // TODO: do we need to restrict this to only SP managers?
      items.push({
        text: 'Reporting',
        href: '/service-provider/performance-report',
        active: this.active === 'Reporting',
      })
    }

    return items
  }
}
