package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class ServiceProviderService(val referralRepository: ReferralRepository) {
  fun getServiceProviderByReferralId(id: UUID): ServiceProvider? {
    return referralRepository.findByIdOrNull(id)?.intervention?.dynamicFrameworkContract?.primeProvider
  }
}
