package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.CreationTimestamp
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToOne
import javax.validation.constraints.NotNull

@Entity
data class Intervention(
  @NotNull @Id @GeneratedValue val id: UUID? = null,
  @NotNull @CreationTimestamp val createdAt: OffsetDateTime? = null,

  @NotNull val title: String,
  @NotNull val description: String,

  @NotNull @OneToOne @JoinColumn(name = "dynamic_framework_contract_id")
  val dynamicFrameworkContract: DynamicFrameworkContract,
)
