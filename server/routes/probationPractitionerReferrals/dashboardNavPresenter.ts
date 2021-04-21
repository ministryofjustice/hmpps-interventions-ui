import { PrimaryNavItem } from '../../utils/viewUtils'

export default class DashboardNavPresenter {
  constructor(private readonly active: string) {}

  readonly items: PrimaryNavItem[] = [
    {
      text: 'My cases',
      href: '/probation-practitioner/dashboard',
      active: this.active === 'My cases',
    },
    {
      text: 'Find interventions',
      href: '/probation-practitioner/find',
      active: this.active === 'Find interventions',
    },
  ]
}
