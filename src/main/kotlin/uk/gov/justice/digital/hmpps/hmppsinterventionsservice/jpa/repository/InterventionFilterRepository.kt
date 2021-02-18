package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegionID

interface InterventionFilterRepository {
  fun findByCriteria(pccRegionIds: List<PCCRegionID>, allowsFemale: Boolean?, allowsMale: Boolean?, minimumAge: Int?, maximumAge: Int?): List<Intervention>
}
