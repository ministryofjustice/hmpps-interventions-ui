package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(name = "pcc_region")
data class PCCRegion(
  @NotNull @Id val id: String,
  @NotNull val name: String,
  @NotNull @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "nps_region_id")
  val region: NPSRegion
)
