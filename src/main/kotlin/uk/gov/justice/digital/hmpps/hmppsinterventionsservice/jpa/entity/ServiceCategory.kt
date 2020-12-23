package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.CreationTimestamp
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id

@Entity
data class ServiceCategory(
  @Id @GeneratedValue var id: UUID? = null,
  @CreationTimestamp var created: OffsetDateTime? = null,
  var name: String
)
