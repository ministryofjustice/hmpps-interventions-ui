package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Entity
import javax.persistence.Id
import javax.validation.constraints.NotNull

@Entity
data class ServiceProvider(
  // Service Provider id maps to the hmpps-auth field Group#groupCode
  @NotNull @Id val id: String,
  @NotNull val name: String,
  @NotNull val incomingReferralDistributionEmail: String,
)
