package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DashboardType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary

interface ReferralSummaryRepository {
  fun getSentReferralSummaries(authUser: AuthUser, serviceProviders: List<String>, dashboardType: DashboardType? = null): List<ServiceProviderSentReferralSummary>
}
