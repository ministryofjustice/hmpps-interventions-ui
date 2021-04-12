package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import java.util.UUID

interface DesiredOutcomeRepository : JpaRepository<DesiredOutcome, UUID> {
  fun findByServiceCategoryId(serviceCategoryId: UUID): List<DesiredOutcome>
}
