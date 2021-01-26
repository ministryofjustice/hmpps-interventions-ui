package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
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

    val desiredOutcomes = listOf(DesiredOutcome(id = UUID.randomUUID(), "Outcome 1"), DesiredOutcome(id = UUID.randomUUID(), "Outcome 2"), DesiredOutcome(id = UUID.randomUUID(), "Outcome 3"))
    desiredOutcomes.forEach { entityManager.persist(it) }
    val categories = listOf(
      ServiceCategory(name = "Accommodation", id = idToFind, created = OffsetDateTime.now(), complexityLevels = emptyList(), desiredOutcomes = desiredOutcomes),
      ServiceCategory(name = "Accommodation", id = UUID.randomUUID(), created = OffsetDateTime.now(), complexityLevels = emptyList(), desiredOutcomes = emptyList())
    )
    categories.forEach { entityManager.persist(it) }
    entityManager.flush()

    val serviceCategory = serviceCategoryService.getServiceCategoryByID(idToFind)
    assertThat(serviceCategory).isNotNull
    assertThat(serviceCategory!!.desiredOutcomes.count()).isEqualTo(3)
  }
}
