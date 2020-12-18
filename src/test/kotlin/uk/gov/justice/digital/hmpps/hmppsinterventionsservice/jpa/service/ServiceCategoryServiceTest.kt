package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository

@DataJpaTest
@ActiveProfiles("db")
class ServiceCategoryServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val serviceCategoryRepository: ServiceCategoryRepository
) {

  private val serviceCategoryService = ServiceCategoryService(serviceCategoryRepository)

  @Test
  fun `get all serviceCategories`() {
    val categories = listOf(ServiceCategory(name = "Category 1"), ServiceCategory(name = "Category 2"))
    categories.forEach { entityManager.persist(it) }
    entityManager.flush()

    val serviceCategories = serviceCategoryService.getServiceCategories()
    assertThat(serviceCategories.count()).isEqualTo(2)
  }
}
