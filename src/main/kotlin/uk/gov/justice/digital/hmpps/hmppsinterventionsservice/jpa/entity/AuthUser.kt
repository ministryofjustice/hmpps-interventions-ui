package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Entity
import javax.persistence.Id
import javax.validation.constraints.NotNull

@Entity
data class AuthUser(
  @Id @NotNull val id: String,
  @NotNull val authSource: String,
  @NotNull val userName: String,
  var deleted: Boolean? = null,
) {
  override fun hashCode(): Int {
    return id.hashCode()
  }

  override fun equals(other: Any?): Boolean {
    if (other == null || other !is AuthUser) {
      return false
    }

    return id == other.id
  }
}
