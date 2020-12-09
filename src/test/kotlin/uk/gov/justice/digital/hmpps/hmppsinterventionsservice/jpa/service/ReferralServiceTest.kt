package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

class ReferralServiceTest {
  private fun newOriginal(): Referral {
    return Referral(
      id = UUID.fromString("3529d30e-3480-4686-b14b-485beb3431ed"),
      created = OffsetDateTime.parse("2021-05-05T13:00:01+01:00"),
      // 👇 business fields
      completionDeadline = LocalDate.parse("2021-06-26")
    )
  }

  @Test
  fun `update cannot overwrite identifier fields`() {
    val update = DraftReferral(
      id = UUID.fromString("ce364949-7301-497b-894d-130f34a98bff"),
      created = OffsetDateTime.parse("2020-12-01T00:00:00+00:00")
    )

    val updated = ReferralService.updateReferral(newOriginal(), update)
    assertThat(updated.id).isEqualTo(UUID.fromString("3529d30e-3480-4686-b14b-485beb3431ed"))
    assertThat(updated.created).isEqualTo(OffsetDateTime.parse("2021-05-05T13:00:01+01:00"))
  }

  @Test
  fun `null fields in the update do not overwrite original fields`() {
    val update = DraftReferral(completionDeadline = null)

    val updated = ReferralService.updateReferral(newOriginal(), update)
    assertThat(updated.completionDeadline).isEqualTo(LocalDate.parse("2021-06-26"))
  }

  @Test
  fun `non-null fields in the update overwrite original fields`() {
    val update = DraftReferral(completionDeadline = LocalDate.parse("2020-12-01"))

    val updated = ReferralService.updateReferral(newOriginal(), update)
    assertThat(updated.completionDeadline).isEqualTo(LocalDate.parse("2020-12-01"))
  }

  @Test
  fun `update mutates the original object`() {
    val original = newOriginal()
    val update = DraftReferral(completionDeadline = LocalDate.parse("2020-12-01"))

    ReferralService.updateReferral(original, update)
    assertThat(original.completionDeadline).isEqualTo(LocalDate.parse("2020-12-01"))
  }
}
