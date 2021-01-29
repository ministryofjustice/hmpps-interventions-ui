package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.io.Serializable
import java.time.LocalDate
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.PrimaryKeyJoinColumn
import javax.persistence.SecondaryTable
import javax.validation.constraints.NotNull

@Entity
@SecondaryTable(name = "contract_eligibility", pkJoinColumns = [PrimaryKeyJoinColumn(name = "dynamic_framework_contract_id")])
data class DynamicFrameworkContract(
  @NotNull @Id @GeneratedValue val id: UUID? = null,

  @NotNull @ManyToOne @JoinColumn(name = "service_category_id")
  val serviceCategory: ServiceCategory,

  @NotNull @ManyToOne @JoinColumn(name = "service_provider_id")
  val serviceProvider: ServiceProvider,

  @NotNull val startDate: LocalDate,
  @NotNull val endDate: LocalDate,

  @Embedded
  val contractEligibility: ContractEligibility,

  @ManyToOne @JoinColumn(name = "nps_region_id")
  val npsRegion: NPSRegion? = null,

  @ManyToOne @JoinColumn(name = "pcc_region_id")
  val pccRegion: PCCRegion? = null,
)

@Embeddable
data class ContractEligibility(
  @NotNull val minimumAge: Int,
  @Column(table = "contract_eligibility")
  @NotNull val maximumAge: Int,
  @Column(table = "contract_eligibility")
  @NotNull val allowsFemale: Boolean,
  @Column(table = "contract_eligibility")
  @NotNull val allowsMale: Boolean,
) : Serializable
