package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.validation.constraints.NotNull

@Entity
data class DesiredOutcome(
  @Id val id: UUID,
  @NotNull val description: String,
  @NotNull @Column(name = "service_category_id") val serviceCategoryId: UUID,
)
