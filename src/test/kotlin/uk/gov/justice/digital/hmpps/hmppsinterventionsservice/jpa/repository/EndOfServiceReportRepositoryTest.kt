package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class EndOfServiceReportRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)

  @Test
  fun `can retrieve an end of service report`() {
    val endOfServiceReport = buildAndPersistEndOfServiceReport()
    val outcome = endOfServiceReport.outcomes.first()

    val savedEndOfServiceReport = endOfServiceReportRepository.findById(endOfServiceReport.id)
    val savedOutcome = savedEndOfServiceReport.get().outcomes.first()

    assertThat(savedEndOfServiceReport.get().createdAt).isEqualTo(endOfServiceReport.createdAt)
    assertThat(savedEndOfServiceReport.get().createdBy).isEqualTo(endOfServiceReport.createdBy)
    assertThat(savedEndOfServiceReport.get().submittedAt).isEqualTo(endOfServiceReport.submittedAt)
    assertThat(savedEndOfServiceReport.get().submittedBy).isEqualTo(endOfServiceReport.submittedBy)
    assertThat(savedEndOfServiceReport.get().furtherInformation).isEqualTo(endOfServiceReport.furtherInformation)
    assertThat(savedEndOfServiceReport.get().outcomes.size).isEqualTo(1)

    assertThat(savedOutcome.desiredOutcome).isEqualTo(outcome.desiredOutcome)
    assertThat(savedOutcome.achievementLevel).isEqualTo(outcome.achievementLevel)
    assertThat(savedOutcome.progressionComments).isEqualTo(outcome.progressionComments)
    assertThat(savedOutcome.additionalTaskComments).isEqualTo(outcome.additionalTaskComments)
  }

  private fun buildAndPersistEndOfServiceReport(): EndOfServiceReport {
    val user = authUserFactory.create(id = "referral_repository_test_user_id")

    val referral = SampleData.sampleReferral("X123456", "Harmony Living", createdBy = user)
    SampleData.persistReferral(entityManager, referral)

    val serviceCategory = SampleData.sampleServiceCategory()
    entityManager.persist(serviceCategory)

    val desiredOutcome = SampleData.sampleDesiredOutcome(description = "Removing Barriers", serviceCategoryId = serviceCategory.id)
    entityManager.persist(desiredOutcome)

    val endOfServiceReport = SampleData.sampleEndOfServiceReport(
      createdBy = user,
      outcomes = listOf(SampleData.sampleEndOfServiceReportOutcome(desiredOutcome = desiredOutcome))
    )

    endOfServiceReportRepository.save(endOfServiceReport)
    entityManager.flush()
    return endOfServiceReport
  }
}
