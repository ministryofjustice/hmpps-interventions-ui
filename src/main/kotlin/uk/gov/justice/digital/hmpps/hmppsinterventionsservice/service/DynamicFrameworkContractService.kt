package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class DynamicFrameworkContractService(val referralRepository: ReferralRepository) {
  fun getDynamicFrameworkContractByReferralId(id: UUID): DynamicFrameworkContract? {
    return referralRepository.findByIdOrNull(id)?.intervention?.dynamicFrameworkContract
  }
}
