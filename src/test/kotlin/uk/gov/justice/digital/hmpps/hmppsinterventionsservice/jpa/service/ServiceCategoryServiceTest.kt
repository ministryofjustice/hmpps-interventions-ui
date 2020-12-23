package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import java.time.OffsetDateTime
import java.util.UUID

@DataJpaTest
@ActiveProfiles("jpa-test")
class ServiceCategoryServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val serviceCategoryRepository: ServiceCategoryRepository
) {
  private val serviceCategoryService = ServiceCategoryService(serviceCategoryRepository)

  @Test
  fun `get non-existent service category returns null`() {
    assertThat(serviceCategoryService.getServiceCategoryByID(UUID.randomUUID())).isNull()
  }

  @Test
  fun `get valid service category`() {
    val idToFind = UUID.randomUUID()

    val categories = listOf(
      ServiceCategory(name = "Accomodation", id = idToFind, created = OffsetDateTime.now(), complexityLevels = emptyList()),
      ServiceCategory(name = "Accomodation", id = UUID.randomUUID(), created = OffsetDateTime.now(), complexityLevels = emptyList())
    )
    categories.forEach { entityManager.persist(it) }
    entityManager.flush()

    assertThat(serviceCategoryService.getServiceCategoryByID(idToFind)).isNotNull()
  }
}
