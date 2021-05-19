package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Entity
import javax.persistence.Id
import javax.validation.constraints.NotNull

typealias AuthGroupID = String

@Entity
data class ServiceProvider(
  // Service Provider id maps to the hmpps-auth field Group#groupCode
  @NotNull @Id val id: AuthGroupID,
  @NotNull val name: String,
  @NotNull val incomingReferralDistributionEmail: String,
) {
  override fun hashCode(): Int {
    return id.hashCode()
  }

  override fun equals(other: Any?): Boolean {
    if (other == null || other !is ServiceProvider) {
      return false
    }

    return id == other.id
  }
}
