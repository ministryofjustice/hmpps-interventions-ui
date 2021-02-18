package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Embeddable
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.validation.constraints.NotNull

@Embeddable
data class ActionPlanActivity(

  // Attributes
  var description: String,

  // For ordering
  @NotNull val createdAt: OffsetDateTime,

  // required fields
  @NotNull @ManyToOne(fetch = FetchType.LAZY) val desiredOutcome: DesiredOutcome,
  @Id val id: UUID
)
