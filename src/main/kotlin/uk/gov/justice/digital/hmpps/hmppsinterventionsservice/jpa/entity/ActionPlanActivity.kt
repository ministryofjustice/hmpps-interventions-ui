package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.OffsetDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.Embeddable
import javax.persistence.FetchType
import javax.persistence.ManyToOne
import javax.validation.constraints.NotNull

@Embeddable
data class ActionPlanActivity(

  // Attributes
  @NotNull val description: String,

  // For ordering
  @NotNull val createdAt: OffsetDateTime = OffsetDateTime.now(),

  // required fields
  @NotNull @ManyToOne(fetch = FetchType.LAZY) val desiredOutcome: DesiredOutcome,

  // as an embedded collection entry each instance have no unique identifier
  // this uuid can be though of as a unique handle to each entry for future use
  @NotNull val id: UUID = randomUUID()

)
