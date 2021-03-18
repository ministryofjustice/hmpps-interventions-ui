package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AchievementLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReportOutcome
import java.time.OffsetDateTime
import java.util.UUID

class EndOfServiceReportFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)

  fun create(
    id: UUID? = null,
    createdAt: OffsetDateTime? = null,
    createdBy: AuthUser? = null,
    submittedAt: OffsetDateTime? = null,
    submittedBy: AuthUser? = null,
    furtherInformation: String? = null,
    outcomes: Set<EndOfServiceReportOutcome>? = null,
    desiredOutcome: DesiredOutcome,
    achievementLevel: AchievementLevel? = null,
    progressionComments: String? = null,
    additionalTaskComments: String? = null,
  ): EndOfServiceReport {
    return save(
      EndOfServiceReport(
        id = id ?: UUID.randomUUID(),
        createdAt = createdAt ?: OffsetDateTime.now(),
        createdBy = createdBy ?: authUserFactory.create(),
        submittedAt = submittedAt ?: OffsetDateTime.now(),
        submittedBy = submittedBy ?: authUserFactory.create(),
        furtherInformation = furtherInformation,
        outcomes = outcomes?.toMutableSet() ?: mutableSetOf(
          EndOfServiceReportOutcome(
            desiredOutcome = desiredOutcome,
            achievementLevel = achievementLevel ?: AchievementLevel.ACHIEVED,
            progressionComments = progressionComments,
            additionalTaskComments = additionalTaskComments,
          )
        )
      )
    )
  }
}
