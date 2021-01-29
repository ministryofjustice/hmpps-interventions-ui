package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(name = "nps_region")
data class NPSRegion(
  @NotNull @Id val id: Char,
  @NotNull val name: String,
)
