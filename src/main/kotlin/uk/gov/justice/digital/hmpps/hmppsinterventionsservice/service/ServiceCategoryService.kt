package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class ServiceCategoryService(val repository: ServiceCategoryRepository) {
  fun getServiceCategoryByID(id: UUID): ServiceCategory? {
    return repository.findByIdOrNull(id)
  }
}
