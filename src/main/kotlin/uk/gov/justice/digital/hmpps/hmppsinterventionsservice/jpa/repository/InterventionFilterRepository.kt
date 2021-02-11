package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention

interface InterventionFilterRepository {
  fun findByCriteria(criteria: MutableMap<String, Array<String>>): List<Intervention>
}