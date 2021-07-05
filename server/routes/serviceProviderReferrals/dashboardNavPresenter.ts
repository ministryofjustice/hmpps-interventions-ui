import { PrimaryNavItem } from '../../utils/viewUtils'

export default class DashboardNavPresenter {
  constructor(private readonly active: string) {}

  readonly items: PrimaryNavItem[] = [
    {
      text: 'All cases',
      href: '/service-provider/dashboard',
      active: this.active === 'All cases',
    },
    // TODO: do we need to restrict this to only SP managers?
    {
      text: 'Reporting',
      href: '/service-provider/performance-report',
      active: this.active === 'Reporting',
    },
  ]
}
