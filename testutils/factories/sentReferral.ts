import { Factory } from 'fishery'
import { ReferralFields, SentReferral } from '../../server/services/interventionsService'
import serviceProviderFactory from './serviceProvider'
import serviceCategoryFactory from './serviceCategory'

const exampleReferralFields = {
  completionDeadline: '2021-04-01',
  serviceProviderId: serviceProviderFactory.build().id,
  serviceCategoryId: serviceCategoryFactory.build().id,
  complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
  furtherInformation: 'Some information about the service user',
  desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
  additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
  accessibilityNeeds: 'She uses a wheelchair',
  needsInterpreter: true,
  interpreterLanguage: 'Spanish',
  hasAdditionalResponsibilities: true,
  whenUnavailable: 'She works Mondays 9am - midday',
  serviceUser: {
    firstName: 'Alex',
  },
  additionalRiskInformation: 'A danger to the elderly',
  usingRarDays: true,
  maximumRarDays: 10,
}

class SentReferralFactory extends Factory<SentReferral> {
  fromFields(fields: ReferralFields) {
    const referralParams = {}
    // This is a possibly clunky way of getting the
    // keys of the ReferralFields type at runtime
    Object.keys(exampleReferralFields).forEach(key => {
      referralParams[key] = fields[key]
    })
    return this.params({ referral: referralParams })
  }
}

export default SentReferralFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  createdAt: new Date().toISOString(),
  referenceNumber: sequence.toString().padStart(8, 'ABC'),
  referral: exampleReferralFields,
}))
