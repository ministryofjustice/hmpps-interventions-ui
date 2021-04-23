package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AchievementLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReportOutcome

class EndOfServiceReportOutcomeFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val desiredOutcomesFactory = DesiredOutcomesFactory(em)
  private val serviceCategoryFactory = ServiceCategoryFactory(em)

  fun create(
    desiredOutcome: DesiredOutcome? = null,
    achievementLevel: AchievementLevel = AchievementLevel.ACHIEVED,
    progressionComments: String? = null,
    additionalTaskComments: String? = null
  ): EndOfServiceReportOutcome {
    return save(
      EndOfServiceReportOutcome(
        desiredOutcome = desiredOutcome ?: desiredOutcomesFactory.create(serviceCategoryFactory.create(), 1)[0],
        achievementLevel = achievementLevel,
        progressionComments = progressionComments,
        additionalTaskComments = additionalTaskComments,
      )
    )
  }
}
