import { Factory } from 'fishery'
import Intervention from '../../server/models/intervention'
import serviceCategoryFactory from './serviceCategory'
import serviceProviderFactory from './serviceProvider'
import eligibilityFactory from './eligibility'
import pccRegionFactory from './pccRegion'

export default Factory.define<Intervention>(({ sequence }) => {
  const serviceCategory = serviceCategoryFactory.build()

  return {
    id: sequence.toString(),
    title: 'Better solutions (anger management)',
    description: `To provide service users with key tools and strategies to address issues of anger management and temper control and
explore the link between thoughts, emotions and behaviour. It provides the opportunity for service users to practice
these strategies in a safe and closed environment.

The service will use the following methods:

• Group therapy sessions
• One-to-one coaching
• Hypnotherapy`,
    npsRegion: { id: 'B', name: 'North West' },
    pccRegions: [
      pccRegionFactory.build({ id: 'cheshire', name: 'Cheshire', npsRegion: { id: 'B', name: 'North West' } }),
      pccRegionFactory.build({ id: 'cumbria', name: 'Cumbria', npsRegion: { id: 'B', name: 'North West' } }),
      pccRegionFactory.build({ id: 'lancashire', name: 'Lancashire', npsRegion: { id: 'B', name: 'North West' } }),
      pccRegionFactory.build({ id: 'merseyside', name: 'Merseyside', npsRegion: { id: 'B', name: 'North West' } }),
    ],
    serviceCategories: [serviceCategory],
    serviceProvider: serviceProviderFactory.build(),
    eligibility: eligibilityFactory.allAdults().build(),
    contractType: {
      code: 'ACC',
      name: 'Accommodation',
    },
    incomingReferralDistributionEmail: 'referrals@better.org',
  }
})
