import { Factory } from 'fishery'
import ServiceProviderSentReferralSummary from '../../server/models/serviceProviderSentReferralSummary'
import SentReferral from '../../server/models/sentReferral'
import Intervention from '../../server/models/intervention'

class ServiceProviderSentReferralSummaryFactory extends Factory<ServiceProviderSentReferralSummary> {
  fromReferralAndIntervention(
    referral: SentReferral,
    intervention: Intervention
  ): Factory<ServiceProviderSentReferralSummary> {
    return this.params({
      referralId: referral.id,
      sentAt: referral.sentAt,
      referenceNumber: referral.referenceNumber,
      interventionTitle: intervention.title,
      serviceUserFirstName: referral.referral.serviceUser.firstName,
      serviceUserLastName: referral.referral.serviceUser.lastName,
    })
  }

  withAssignedUser(username: string) {
    return this.params({
      assignedToUserName: username,
    })
  }

  unassigned() {
    return this.params({
      assignedToUserName: null,
    })
  }

  completed() {
    return this.params({
      endOfServiceReportSubmitted: true,
    })
  }

  open() {
    return this.params({
      endOfServiceReportSubmitted: false,
    })
  }
}
export default ServiceProviderSentReferralSummaryFactory.define(({ sequence }) => ({
  referralId: sequence.toString(),
  sentAt: '2021-01-26T13:00:00.000000Z',
  referenceNumber: 'ABCABCA2',
  interventionTitle: 'Social Inclusion - West Midlands',
  serviceUserFirstName: 'Jenny',
  serviceUserLastName: 'Jones',
}))
