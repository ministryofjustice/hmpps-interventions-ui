package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id

@Entity
data class ComplexityLevel(
  @Id val id: UUID,
  val title: String,
  val description: String,
)
