package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.validation.constraints.NotNull

@Entity
class CaseNote(
  @Id
  val id: UUID,
  @NotNull @ManyToOne(fetch = FetchType.LAZY)
  var referral: Referral,
  @NotNull var subject: String,
  @NotNull var body: String,
  @NotNull val sentAt: OffsetDateTime,
  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val sentBy: AuthUser,
)
