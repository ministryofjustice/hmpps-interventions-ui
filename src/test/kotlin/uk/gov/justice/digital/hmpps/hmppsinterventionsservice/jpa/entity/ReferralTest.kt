package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID

internal class ReferralTest {
  private val referralFactory = ReferralFactory()
  private val authUserFactory = AuthUserFactory()
  private val actionPlanFactory = ActionPlanFactory()

  @Nested
  inner class Assignments {
    @Test
    fun `currentAssignment returns most recent assignment even if list order is wrong`() {
      val currentAssignee = authUserFactory.createSP(userName = "current")
      val oldAssignee = authUserFactory.createSP(userName = "old")
      val referral = referralFactory.createSent(
        assignments = listOf(
          ReferralAssignment(OffsetDateTime.now(), currentAssignee, currentAssignee),
          ReferralAssignment(OffsetDateTime.now().minusHours(2), oldAssignee, oldAssignee)
        )
      )

      assertThat(referral.currentAssignment!!.assignedTo).isEqualTo(currentAssignee)
    }

    @Test
    fun `currentAssignee returns most recent assignment assignedTo`() {
      val currentAssignee = authUserFactory.createSP(userName = "current")
      val oldAssignee = authUserFactory.createSP(userName = "old")
      val referral = referralFactory.createSent(
        assignments = listOf(
          ReferralAssignment(OffsetDateTime.now(), currentAssignee, currentAssignee),
          ReferralAssignment(OffsetDateTime.now().minusHours(2), oldAssignee, oldAssignee)
        )
      )

      assertThat(referral.currentAssignee).isEqualTo(currentAssignee)
    }
  }

  @Nested inner class ActionPlans {
    @Test
    fun `approvedActionPlan returns null if there are no approved action plan`() {
      val referral = referralFactory.createSent(
        actionPlans = mutableListOf(
          actionPlanFactory.createSubmitted()
        )
      )

      assertThat(referral.approvedActionPlan).isNull()
    }

    @Test
    fun `approvedActionPlan returns most recent approved action plan`() {
      val correctId = UUID.randomUUID()
      val referral = referralFactory.createSent(
        actionPlans = mutableListOf(
          actionPlanFactory.createSubmitted(),
          actionPlanFactory.createApproved(createdAt = OffsetDateTime.now().minusHours(1)),
          actionPlanFactory.createApproved(createdAt = OffsetDateTime.now(), id = correctId)
        )
      )
      assertThat(referral.approvedActionPlan?.id).isEqualTo(correctId)
    }
  }

  @Nested
  inner class NumberOfSessions {
    @Test
    fun `maximum number of sessions in previous plans gets largest number`() {
      val referral = referralFactory.createSent(
        actionPlans = mutableListOf(
          actionPlanFactory.createApproved(numberOfSessions = 2),
          actionPlanFactory.createApproved(numberOfSessions = 1)
        )
      )
      assertThat(referral.maximumNumberOfSessionsInPreviousAllApprovedPlans).isEqualTo(2)
    }

    @Test
    fun `maximum number of sessions in previous plans ignores non approved plans`() {
      val referral = referralFactory.createSent(
        actionPlans = mutableListOf(
          actionPlanFactory.createSubmitted(numberOfSessions = 3),
          actionPlanFactory.createApproved(numberOfSessions = 2),
        )
      )
      assertThat(referral.maximumNumberOfSessionsInPreviousAllApprovedPlans).isEqualTo(2)
    }

    @Test
    fun `maximum number of sessions is null when no plan list exist`() {
      val referral = referralFactory.createSent(actionPlans = mutableListOf())
      assertThat(referral.maximumNumberOfSessionsInPreviousAllApprovedPlans).isNull()
    }

    @Test
    fun `maximum number of sessions is null when no plans exist`() {
      val referral = referralFactory.createSent(actionPlans = null)
      assertThat(referral.maximumNumberOfSessionsInPreviousAllApprovedPlans).isNull()
    }
  }
}
