package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.CreationTimestamp
import java.util.Date
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id

@Entity
data class Referral(
  @CreationTimestamp var created: Date? = null,
  @Id @GeneratedValue var id: UUID? = null,
)
