package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany

@Entity
data class ContractType(
  @Id val id: UUID,
  val name: String,
  val code: String,

  @ManyToMany
  @JoinTable(
    name = "contract_type_service_category",
    joinColumns = [JoinColumn(name = "contract_type_id")],
    inverseJoinColumns = [JoinColumn(name = "service_category_id")]
  )
  val serviceCategories: Set<ServiceCategory> = setOf(),
)
