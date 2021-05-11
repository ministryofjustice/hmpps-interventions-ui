package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.LocalDate
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.ManyToOne
import javax.validation.constraints.NotNull

@Entity
data class DynamicFrameworkContract(
  @Id val id: UUID,

  @NotNull @ManyToOne @JoinColumn(name = "service_category_id")
  val serviceCategory: ServiceCategory,

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
)
