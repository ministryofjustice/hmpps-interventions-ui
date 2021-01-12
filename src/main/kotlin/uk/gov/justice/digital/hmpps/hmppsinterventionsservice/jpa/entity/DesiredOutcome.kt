package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id

@Entity
data class DesiredOutcome(
  @Id val id: UUID,
  val description: String
)
