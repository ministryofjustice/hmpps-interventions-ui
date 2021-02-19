package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.OffsetDateTime
import javax.persistence.Embeddable
import javax.persistence.FetchType
import javax.persistence.ManyToOne
import javax.validation.constraints.NotNull

@Embeddable
data class ActionPlanActivity(

  // Attributes
  @NotNull val description: String,

  // For ordering
  @NotNull val createdAt: OffsetDateTime,

  // required fields
  @NotNull @ManyToOne(fetch = FetchType.LAZY) val desiredOutcome: DesiredOutcome,
)
