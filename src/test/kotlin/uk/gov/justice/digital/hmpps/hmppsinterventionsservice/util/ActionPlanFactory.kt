package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

class ActionPlanFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)
  private val referralFactory = ReferralFactory(em)

  fun create(
    id: UUID? = null,
    referral: Referral? = null,
    numberOfSessions: Int? = null,
    createdAt: OffsetDateTime? = null,
    createdBy: AuthUser? = null,
  ): ActionPlan {
    return save(
      ActionPlan(
        id = id ?: UUID.randomUUID(),
        referral = referral ?: referralFactory.createSent(),
        numberOfSessions = numberOfSessions,
        createdAt = createdAt ?: OffsetDateTime.now(),
        createdBy = createdBy ?: authUserFactory.create(),
        activities = mutableListOf()
      )
    )
  }
}
