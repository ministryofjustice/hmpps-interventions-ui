package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.ManyToOne
import javax.persistence.NamedAttributeNode
import javax.persistence.NamedEntityGraph
import javax.persistence.NamedSubgraph
import javax.validation.constraints.NotNull

@NamedEntityGraph(
  name = "entity-dynamicFrameWorkContract-graph",
  attributeNodes =
  [
    NamedAttributeNode("primeProvider"),
    NamedAttributeNode("npsRegion"),
    NamedAttributeNode(value = "pccRegion", subgraph = "pcc-region"),
    NamedAttributeNode("subcontractorProviders"),
    NamedAttributeNode(value = "contractType", subgraph = "contractType")
  ],
  subgraphs = [
    NamedSubgraph(
      name = "pcc-region",
      attributeNodes = [
        NamedAttributeNode("npsRegion"),
      ]
    ),
    NamedSubgraph(
      name = "contractType",
      attributeNodes = [
        NamedAttributeNode("serviceCategories"),
      ]
    )
  ]
)
@Entity
data class DynamicFrameworkContract(
  @Id val id: UUID,

  @NotNull @ManyToOne @JoinColumn(name = "prime_provider_id")
  val primeProvider: ServiceProvider,

  @NotNull val startDate: LocalDate,
  @NotNull val endDate: LocalDate,

  @ManyToOne @JoinColumn(name = "nps_region_id")
  val npsRegion: NPSRegion? = null,

  @ManyToOne @JoinColumn(name = "pcc_region_id")
  val pccRegion: PCCRegion? = null,

  @NotNull val minimumAge: Int,
  val maximumAge: Int?,
  @NotNull val allowsFemale: Boolean,
  @NotNull val allowsMale: Boolean,

  val contractReference: String,

  @ManyToMany
  @JoinTable(
    name = "dynamic_framework_contract_sub_contractor",
    joinColumns = [JoinColumn(name = "dynamic_framework_contract_id")],
    inverseJoinColumns = [JoinColumn(name = "subcontractor_provider_id")]
  )
  val subcontractorProviders: Set<ServiceProvider> = setOf(),

  @NotNull @ManyToOne @JoinColumn(name = "contract_type_id")
  val contractType: ContractType,

) {
  // using contract_reference for hashCode and equals because
  // it's guaranteed to have a unique hash (UUID isn't).
  // the field is enforced as unique at the database level.
  override fun hashCode(): Int {
    return contractReference.hashCode()
  }

  override fun equals(other: Any?): Boolean {
    if (other == null || other !is DynamicFrameworkContract) {
      return false
    }

    return contractReference == other.contractReference
  }
}
