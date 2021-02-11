package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceCategoryFactory
import java.util.UUID

@RepositoryTest
class ServiceCategoryServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val serviceCategoryRepository: ServiceCategoryRepository
) {
  private val serviceCategoryService = ServiceCategoryService(serviceCategoryRepository)
  private val serviceCategoryFactory = ServiceCategoryFactory(entityManager)

  @Test
  fun `get non-existent service category returns null`() {
    assertThat(serviceCategoryService.getServiceCategoryByID(UUID.randomUUID())).isNull()
  }

  @Test
  fun `get valid service category`() {
    val idToFind = UUID.randomUUID()

    val desiredOutcomes = listOf(
      DesiredOutcome(id = UUID.randomUUID(), "Outcome 1", idToFind),
      DesiredOutcome(id = UUID.randomUUID(), "Outcome 2", idToFind),
      DesiredOutcome(id = UUID.randomUUID(), "Outcome 3", idToFind),
    )

    serviceCategoryFactory.create(id = idToFind, desiredOutcomes = desiredOutcomes)
    serviceCategoryFactory.create(id = UUID.randomUUID())

    val serviceCategory = serviceCategoryService.getServiceCategoryByID(idToFind)
    assertThat(serviceCategory).isNotNull
    assertThat(serviceCategory!!.desiredOutcomes.count()).isEqualTo(3)
  }
}
