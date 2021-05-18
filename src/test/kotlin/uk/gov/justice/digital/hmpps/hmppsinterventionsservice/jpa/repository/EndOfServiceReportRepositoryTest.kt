package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AchievementLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReportOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DesiredOutcomesFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.InterventionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class EndOfServiceReportRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
) {
  private val interventionFactory = InterventionFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  private val desiredOutcomesFactory = DesiredOutcomesFactory(entityManager)
  private val endOfServiceReportFactory = EndOfServiceReportFactory(entityManager)

  @Test
  fun `can retrieve an end of service report`() {
    val intervention = interventionFactory.create()
    val outcomes = desiredOutcomesFactory.create(intervention.dynamicFrameworkContract.contractType.serviceCategories.elementAt(0), 1)
    val referral = referralFactory.createSent(desiredOutcomes = outcomes)
    val endOfServiceReport = endOfServiceReportFactory.create(
      referral = referral,
      outcomes = outcomes.map {
        EndOfServiceReportOutcome(it, AchievementLevel.ACHIEVED, "alex did really well")
      }.toMutableSet()
    )

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
}
