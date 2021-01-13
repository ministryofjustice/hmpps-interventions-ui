package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.CreationTimestamp
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToMany

@Entity
data class ServiceCategory(
  @Id val id: UUID,
  @CreationTimestamp val created: OffsetDateTime,
  val name: String,
  @OneToMany @JoinColumn(name = "service_category_id") val complexityLevels: List<ComplexityLevel>,

  @OneToMany @JoinColumn(name = "service_category_id")
  val desiredOutcomes: List<DesiredOutcome>
)
