import config from '../../../config'
import LoggedInUser from '../../../models/loggedInUser'

export type PrimaryNavBarHeading = 'Referrals' | 'Reporting' | 'Find interventions' | 'My services'
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
        text: 'Referrals',
        href: '/probation-practitioner/dashboard',
        active: this.active === 'Referrals',
      })
      items.push({
        text: 'Find interventions',
        href: '/probation-practitioner/find',
        active: this.active === 'Find interventions',
      })
    }

    if (this.loggedInUser.token.roles.includes('ROLE_INTERVENTIONS_SERVICE_EDITOR')) {
      items.push({
        text: 'My services',
        href: '/service-editor/dashboard',
        active: this.active === 'My services',
      })
    }

    return items
  }
}
