package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CaseNote
import java.util.UUID

interface CaseNoteRepository : PagingAndSortingRepository<CaseNote, UUID> {
  fun findAllByReferralId(referralId: UUID, pageable: Pageable?): Page<CaseNote>
}
