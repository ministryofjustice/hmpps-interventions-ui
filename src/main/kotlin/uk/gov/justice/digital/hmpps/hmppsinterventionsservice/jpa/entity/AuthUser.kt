package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Entity
import javax.persistence.Id
import javax.validation.constraints.NotNull

@Entity
data class AuthUser(
  @Id @NotNull val id: String,
  @NotNull val authSource: String,
)
