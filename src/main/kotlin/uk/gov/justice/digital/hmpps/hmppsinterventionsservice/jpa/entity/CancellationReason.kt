package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Entity
import javax.persistence.Id

@Entity
data class CancellationReason(
  @Id val code: String,
  val description: String
)
