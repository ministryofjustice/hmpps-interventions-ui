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

  fun createSubmitted(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    numberOfSessions: Int? = null,
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    submittedAt: OffsetDateTime? = createdAt,
    submittedBy: AuthUser? = createdBy,
  ): ActionPlan {
    return create(
      id = id,
      referral = referral,
      numberOfSessions = numberOfSessions,
      createdAt = createdAt,
      createdBy = createdBy,
      submittedAt = submittedAt,
      submittedBy = submittedBy,
    )
  }

  fun createApproved(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    numberOfSessions: Int? = null,
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    submittedAt: OffsetDateTime? = createdAt,
    submittedBy: AuthUser? = createdBy,
    approvedAt: OffsetDateTime? = submittedAt,
    approvedBy: AuthUser? = authUserFactory.create(authSource = "delius"),
  ): ActionPlan {
    return create(
      id = id,
      referral = referral,
      numberOfSessions = numberOfSessions,
      createdAt = createdAt,
      createdBy = createdBy,
      submittedAt = submittedAt,
      submittedBy = submittedBy,
      approvedAt = approvedAt,
      approvedBy = approvedBy,
    )
  }

  fun create(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    numberOfSessions: Int? = null,
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    submittedAt: OffsetDateTime? = null,
    submittedBy: AuthUser? = null,
    approvedAt: OffsetDateTime? = null,
    approvedBy: AuthUser? = null,
  ): ActionPlan {
    return save(
      ActionPlan(
        id = id,
        referral = referral,
        numberOfSessions = numberOfSessions,
        createdAt = createdAt,
        createdBy = createdBy,
        submittedAt = submittedAt,
        submittedBy = submittedBy,
        approvedAt = approvedAt,
        approvedBy = approvedBy,
        activities = mutableListOf()
      )
    )
  }
}
