package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class CancellationReasonRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val cancellationReasonRepository: CancellationReasonRepository,
) {
  @Test
  fun `can retrieve a cancellation reason`() {
    val persistedReason = cancellationReasonRepository.findById("MIS").get()

    assertThat(persistedReason).isNotNull
    assertThat(persistedReason.code).isEqualTo("MIS")
    assertThat(persistedReason.description).isEqualTo("Referral was made by mistake")
  }
}
