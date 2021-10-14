import config from '../../../config'
import LoggedInUser from '../../../models/loggedInUser'

export type PrimaryNavBarHeading = 'Referrals' | 'Reporting' | 'My cases' | 'Find interventions'
export type PrimaryNavBarItem = { text: PrimaryNavBarHeading; href: string; active: boolean }

export default class PrimaryNavBarPresenter {
  constructor(private readonly active: PrimaryNavBarHeading, private readonly loggedInUser: LoggedInUser) {}

  // populate the nav bar items based on user roles
  get items(): PrimaryNavBarItem[] {
    const items: PrimaryNavBarItem[] = []

    if (this.loggedInUser.token.roles.includes('ROLE_CRS_PROVIDER')) {
      items.push({
        text: 'Referrals',
        href: '/service-provider/dashboard/my-cases',
        active: this.active === 'Referrals',
      })

      if (config.features.serviceProviderReporting) {
        // TODO: do we need to restrict this to only SP managers?
        items.push({
          text: 'Reporting',
          href: '/service-provider/performance-report',
          active: this.active === 'Reporting',
        })
      }
    }

    if (this.loggedInUser.token.roles.includes('ROLE_PROBATION')) {
      items.push({
        text: 'My cases',
        href: '/probation-practitioner/dashboard',
        active: this.active === 'My cases',
      })
      items.push({
        text: 'Find interventions',
        href: '/probation-practitioner/find',
        active: this.active === 'Find interventions',
      })
    }

    return items
  }
}
