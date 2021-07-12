package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime

internal class ReferralTest {
  private val referralFactory = ReferralFactory()
  private val authUserFactory = AuthUserFactory()

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
}
