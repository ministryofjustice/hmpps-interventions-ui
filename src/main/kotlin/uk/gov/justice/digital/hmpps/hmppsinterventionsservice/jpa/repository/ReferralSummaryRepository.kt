package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary

interface ReferralSummaryRepository {
  fun getSentReferralSummaries(serviceProviders: List<String>): List<ServiceProviderSentReferralSummary>
}
