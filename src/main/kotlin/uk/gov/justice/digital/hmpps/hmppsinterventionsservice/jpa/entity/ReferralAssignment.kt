package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.OffsetDateTime
import javax.persistence.Embeddable
import javax.persistence.ManyToOne

@Embeddable
class ReferralAssignment(
  val assignedAt: OffsetDateTime,
  @ManyToOne @Fetch(FetchMode.JOIN) val assignedBy: AuthUser,
  @ManyToOne @Fetch(FetchMode.JOIN) val assignedTo: AuthUser,
)
