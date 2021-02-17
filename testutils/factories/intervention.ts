import { Factory } from 'fishery'
import { Intervention } from '../../server/services/interventionsService'
import serviceCategoryFactory from './serviceCategory'
import serviceProviderFactory from './serviceProvider'
import eligibilityFactory from './eligibility'

export default Factory.define<Intervention>(sequence => ({
  id: sequence.toString(),
  title: 'Better solutions (anger management)',
  description:
    'To provide service users with key tools and strategies to address issues of anger management and temper control and explore the link between thoughts, emotions and behaviour. It provides the opportunity for service users to practice these strategies in a safe and closed environment.',
  npsRegion: { id: 'B', name: 'North West' },
  pccRegions: [
    { id: 'cheshire', name: 'Cheshire' },
    { id: 'cumbria', name: 'Cumbria' },
    { id: 'lancashire', name: 'Lancashire' },
    { id: 'merseyside', name: 'Merseyside' },
  ],
  serviceCategory: serviceCategoryFactory.build(),
  serviceProvider: serviceProviderFactory.build(),
  eligibility: eligibilityFactory.allAdults().build(),
}))
